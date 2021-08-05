'use strict';

const { Sequelize, Model, Op, DataTypes } = require('sequelize');
const sequelize = new Sequelize('to-do-list', 'root', 'liaojunxihugo330', {
    dialect: 'mysql',
    logging: false
});

const PORT = process.env.PORT || 3000;

const http = require('http');
const Koa = require('koa');
const Router = require('@koa/router');
const render = require('koa-ejs');
const path = require('path');
const serve = require('koa-static');    // serves static files.
const koaBody = require('koa-body');

const router = new Router();
const app = new Koa();

const staticDirPath = path.join(__dirname, 'public');

// app.use(async (ctx, next) => {
//     try {
//         await next();
//     } catch(err) {
//         ctx.status = err.status || 500;
//         ctx.body = err.message;
//     }
// });

app.on('error', (err, ctx) => {
    log.error('server error', err, ctx);
});

// router.get('error', '/error', (ctx) => {
//     ctx.throw(500, 'internal server error');
// });

// default display index.html
router.get('index', '/', (ctx) => {
    ctx.redirect('/index.html');
});

router.get('singleDayTask', '/single-day/:day', (ctx) => {
    ctx.body = 'To-do list for ' + ctx.params.day.toString().toUpperCase() + '.';
});

router.post('addTask', '/addItem', (ctx) => {
    console.log(ctx.request.body);
    ctx.redirect('/');
});

app
    .use(serve(staticDirPath))
    .use(koaBody())
    .use(router.routes())
    .use(router.allowedMethods());
    

async function init() {

    // Open db connection.
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (err) {
        console.log('Unable to connect to database:', err);
    }
    http.createServer(app.callback()).listen(PORT, () => {
        console.log('server ready.')
    });
    
}

init();


