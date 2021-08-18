'use strict';

// web-server related stuff
const PORT = process.env.PORT || 3000;

const Koa = require('koa');
const Router = require('@koa/router');
const FS = require('fs');

const http = require('http');
const path = require('path');
const serve = require('koa-static');
const koaBody = require('koa-body');
const session = require('koa-session');

const app = new Koa();
const router = new Router();

// database tools
const { Sequelize, Model, Op, DataTypes } = require('sequelize');
const sequelize = new Sequelize('to-do-list', 'root', 'liaojunxihugo330', {
    dialect: 'mysql',
    logging: false
});

// paths to directories.
const ROOT_PATH = '/Users/hugo/Documents/SU21_Intern/todolist/';
const staticDirPath = path.join(ROOT_PATH, 'public/');
const modelDirPath = path.join(ROOT_PATH, 'model/');

// import models
const User = require(path.join(modelDirPath, 'User.js'))(sequelize, DataTypes);
const Task = require(path.join(modelDirPath, 'Task.js'))(sequelize, DataTypes);
const Token = require(path.join(modelDirPath, 'Token.js'))(sequelize, DataTypes);
// const Weekday = require(path.join(modelDirPath, 'Weekday.js'))(sequelize, DataTypes);

// config for cookie in koa-session.

// app.keys = ['secret_tdlist'];

const CONFIG = {
    key: 'tdl.sess', /** (string) cookie key (default is koa.sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 300000, // <-- five minute // 86400000, // <-- default
    autoCommit: true, /** (boolean) automatically commit headers (default true) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: false, /** (boolean) httpOnly or not (default true) */
    signed: false, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. 
        The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    secure: false, /** (boolean) secure cookie*/
    sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
};


app.on('error', (err, ctx) => {
    console.error('Internal server error', err, ctx);
});

app
    // .use(session(app))
    .use(session(CONFIG, app))
    .use(serve(staticDirPath))
    .use(koaBody())
    .use(router.routes())
    .use(router.allowedMethods());

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (err) {
        console.error('Unable to connect to database:', err);
    }

    try {
        await sequelize.sync({ alter: true });
        console.log('The tables for Users, Tokens and Tasks have been (re)created.');
    } catch (err) {
        console.error(err.message);
    }

    http.createServer(app.callback()).listen(PORT, () => {
        console.log('server ready on', PORT);
    });
})()



router.get('getTask', '/getTask', async (ctx) => {
    ctx.body = await Task.findAll({
        attributes: {
            exclude: ['userId']
        },
        where: {
            userId: ctx.session.id
        },
        order: [
            ['complete', 'ASC'],
            ['dueDate', 'ASC'],
            ['dueTime', 'ASC']
        ],
        raw: true
    });
});

router.get('getSessionStatus', '/get-session-status', async (ctx) => {
    // console.log('session status >>>> ', ctx.session);
    // console.log('cookies status >>>> ', ctx.cookies.get(CONFIG.key));
    ctx.body = {
        name: ctx.session.name,
        message: ctx.session.message
    };
});

router.get('userLogin', '/login', async (ctx) => {
    ctx.type = 'html';
    ctx.body = FS.createReadStream(path.join(staticDirPath, 'login.html'));
});

router.get('userLogout', '/logout', async (ctx) => {
    // console.log('Logout user');
    ctx.session = null;
    ctx.redirect('/');
});

router.post('addTask', '/addTask', async (ctx) => {
    const bdy = ctx.request.body;
    if (bdy.dueDate == '') {
        bdy.dueDate = null;
        bdy.dueTime = null;
    }
    if (bdy.dueTime == '') {
        bdy.dueTime = null;
    }
    bdy.userId = ctx.session.id;
    ctx.body = await Task.create(bdy);
    ctx.redirect('/');
});

router.post('toggleComplete', '/toggle-complete', async (ctx) => {
    ctx.body = await Task.update(
        { complete: Sequelize.literal('NOT complete') },
        { where: { id: ctx.request.body.taskId } }
    );
    ctx.redirect('/');
});

router.post('userLogin', '/login', async (ctx) => {
    const bdy = ctx.request.body;
    const user = await User.findOne({
        attributes: ['password', 'name', 'id'],
        where: {
            loginId: bdy.loginId
        },
        raw: true
    });
    console.log(user);
    if (user) {
        // console.log('prev. session>>>>>', ctx.session);
        if (user.password == bdy.password) {
            ctx.session.name = user.name;
            ctx.session.id = user.id;
            ctx.session.message = 'Successfully logged in as: ' + user.name;
            ctx.redirect('/');
        } else {
            ctx.session.name = null;
            ctx.session.id = null;
            ctx.session.message = 'Wrong username/password combination.';
            ctx.redirect('/login');
        }
    } else {
        ctx.session.message = 'User doesn\'t exist.';
        ctx.redirect('/login');
    }

    console.log('session>>>>>', ctx.session);
});


router.post('createUser', '/create-user', async (ctx) => {
    const bdy = ctx.request.body;
    console.log(bdy);
    const user = await User.findAll({
        where: {
            loginId: bdy.loginId
        }
    });
    if (user.length > 0) {
        ctx.session.message = 'The loginId you entered exists. Please use other loginId\'s.';
        ctx.redirect('login');
    } else {
        ctx.body = await User.create(bdy);
        ctx.session.message = 'Sucessfully created user ' + bdy.loginId + '. Please login';
        ctx.redirect('/login');
    }
});

router.delete('deleteTask', '/delete/:id', async (ctx) => {
    ctx.body = await Task.destroy({
        where: {
            id: ctx.params.id
        }
    })
});

