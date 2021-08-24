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
const { Sequelize, Model, Op, DataTypes, DatabaseError } = require('sequelize');
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
// const Token = require(path.join(modelDirPath, 'Token.js'))(sequelize, DataTypes);
// const Weekday = require(path.join(modelDirPath, 'Weekday.js'))(sequelize, DataTypes);

// config for cookie in koa-session.

app.keys = ['secret_tdlist'];

const CONFIG = {
    key: 'tdl.sess', /** (string) cookie key (default is koa.sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 60000, //300000, // <-- five minute // 86400000, // <-- default
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
        // await sequelize.sync({ alter: true });
        await sequelize.sync();
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
    if (ctx.session.id) {
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
    }
});

router.post('toggleComplete', '/toggle-complete', async (ctx) => {
    console.log('Session userId >>>> ', ctx.session.id);
    if (ctx.session.id) {
        ctx.body = await Task.update({
            complete: Sequelize.literal('NOT complete')
        }, {
            where: { id: ctx.request.body.taskId }
        });
    }
    ctx.redirect('/');
});

router.post('bulkTest', '/bulk-test', async (ctx) => {
    // const n = 10;
    // const m = 100000;
    const arr = new Array(parseInt(ctx.request.body.n));
    let bulk = [];
    for (let i = 0; i < ctx.request.body.m; i++) {
        const newTask = {
            taskName: 'bulk' + i,
            note: 'test.',
            userId: 3
        };
        bulk.push(newTask);
    };

    // 串行
    let start = new Date();
    console.log('串行: Start >>>>', start.toLocaleTimeString());
    for (let i = 0; i < ctx.request.body.n; i++) {
        for (let j = 0; j < bulk.length; j++) {
            bulk[j].taskName = '串行bulk' + i + j + parseInt((Math.random() * 10));
        }
        await Task.bulkCreate(bulk);
    }
    let end = new Date();
    console.log('End >>>>', end.toLocaleTimeString());
    console.log('diff >>>>', end - start);
    // ctx.body = end - start;


    // 并行
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < bulk.length; j++) {
            const name = '并行bulk' + i + j + parseInt((Math.random() * 10));
            // console.log(name);
            bulk[j].taskName = name; //'并行bulk' + i + j + parseInt((Math.random() * 10));
        }
        arr[i] = bulk;
    }
    const tasks = arr.map(bulk => Task.bulkCreate(bulk));
    start = new Date();
    console.log('并行: Start >>>>', start.toLocaleTimeString());
    await Promise.all(tasks);
    end = new Date();
    console.log('End >>>>', end.toLocaleTimeString());
    console.log('diff >>>>', end - start);
    ctx.body = end - start;
});

router.post('bulkInsert', '/bulk-create', async (ctx) => {
    console.log('Init >>>>> ', new Date().toLocaleTimeString());
    let bulk = [];
    for (let i = 0; i < ctx.request.body.size; i++) {
        const newTask = {
            taskName: 'bulk' + i,
            note: 'test.',
            userId: 3
        };
        bulk.push(newTask);
    };
    const start = new Date();
    console.log('start >>>>', start.toLocaleTimeString());
    await Task.bulkCreate(bulk);
    const end = new Date();
    console.log('End >>>>', end.toLocaleTimeString());
    console.log('diff >>>>', end - start);
    ctx.body = end - start;
});

router.post('individualInsert', '/indiv-create', async (ctx) => {
    const start = new Date();
    console.log('Start >>>>> ', start.toLocaleTimeString());
    for (let i = 0; i < ctx.request.body.size; i++) {
        const newTask = {
            taskName: 'individual' + i,
            note: 'test.',
            userId: 3
        };
        await Task.create(newTask);
    };
    const end = new Date();
    console.log('End >>>>', end.toLocaleTimeString());
    console.log('diff >>>>', end - start);
    ctx.body = end - start;
});

router.post('bulkUpdate', '/bulk-update', async (ctx) => {
    let bulk = [...Array(parseInt(ctx.request.body.size)).keys()]
    const start = new Date();
    console.log('start >>>>', start.toLocaleTimeString());
    await Task.update({
        complete: Sequelize.literal('NOT complete')
    }, {
        where: { id: bulk }
    });
    const end = new Date();
    console.log('End >>>>', end.toLocaleTimeString());
    console.log('diff >>>>', end - start);
    ctx.body = end - start;
});

router.post('individualUpdate', '/indiv-update', async (ctx) => {
    const start = new Date();
    console.log('Start >>>>> ', start.toLocaleTimeString());
    for (let i = 0; i < ctx.request.body.size; i++) {
        await Task.update({
            complete: Sequelize.literal('NOT complete')
        }, {
            where: { id: i }
        });
    };
    const end = new Date();
    console.log('End >>>>', end.toLocaleTimeString());
    console.log('diff >>>>', end - start);
    ctx.body = end - start;
})

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
        ctx.session.message = 'Sucessfully created user ' + bdy.loginId + '. Please login.';
        ctx.redirect('/login');
    }
});

router.delete('deleteTask', '/delete/:id', async (ctx) => {
    if (ctx.session.id) {
        ctx.body = await Task.destroy({
            where: {
                id: ctx.params.id
            }
        })
    }
});


