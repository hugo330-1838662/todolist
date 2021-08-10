'use strict';

const { Sequelize, Model, Op, DataTypes } = require('sequelize');
const sequelize = new Sequelize('to-do-list', 'root', 'liaojunxihugo330', {
    dialect: 'mysql',
    logging: false
});

const PORT = process.env.PORT || 3001;

const http = require('http');
const Koa = require('koa');
const Router = require('@koa/router');
// const render = require('koa-ejs');
const path = require('path');
const serve = require('koa-static');    // serves static files.
const koaBody = require('koa-body');

const router = new Router();
// const router = require('./router.js');
const app = new Koa();

// paths to directories.
const staticDirPath = path.join(__dirname, '../public');
const modelDirPath = path.join(__dirname, '../models');

// create models
const User = require(path.join(modelDirPath, 'User.js'))(sequelize, DataTypes);
const Task = require(path.join(modelDirPath, 'Task.js'))(sequelize, DataTypes);
const Weekday = require(path.join(modelDirPath, 'Weekday.js'))(sequelize, DataTypes);

// app.use(async (ctx, next) => {
//     try {
//         await next();
//     } catch(err) {
//         ctx.status = err.status || 500;
//         ctx.body = err.message;
//     }
// });

app.on('error', (err, ctx) => {
    console.error('server error', err, ctx);
});

// router.get('error', '/error', (ctx) => {
//     ctx.throw(500, 'internal server error');
// });



// default display index.html
router.get('index', '/', (ctx) => {
    ctx.redirect('/index.html');
});

router.get('singleDayTask', '/single-day/:day', async (ctx) => {
    // ctx.body = 'To-do list for ' + ctx.params.day + '.';
    // getTask(ctx);
    let res;
    if (ctx.params.day == -1) {
        res = await Task.findAll({ attributes: ['dayId', 'taskName']});
    } else {
        res = await Task.findAll({
            attributes: ['taskName'],
            where: { dayId: ctx.params.day }
        });
    }
    ctx.body = res;
});

// async function getTask(ctx) {
//     if (ctx.params.day === -1) {
//         Task.findAll({ attributes: [['taskName', 'Task Name']]})
//     } else {
//         Task.findAll({
//             attributes: [['taskName', 'Task Name']],
//             where: { dayId: ctx.params.day}
//         })
//     }
// }

router.post('addTask', '/addItem', (ctx) => {
    const bdy = ctx.request.body;
    console.log(bdy);
    if (!bdy.time) {
        bdy.time = '-1';
    }
    console.log(bdy);
    Task.create({
         taskName: bdy.task,
         time: bdy.time,
         dayId: bdy.day,
         note: bdy.note
    }).then(() => {
        console.log('success!')
    }).then(ctx.redirect('/'));
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
        console.error('Unable to connect to database:', err);
    }
    http.createServer(app.callback()).listen(PORT, () => {
        console.log('server ready.')
    });
    
    try {
        await Task.belongsTo(Weekday, { foreignKey: 'dayId' });
        await User.hasMany(Task);
        await User.sync({alter: true});
        await Weekday.sync({alter: true});
        await Task.sync({alter: true});
        
        // await User.sync({force: true});
        // await Weekday.sync({force: true});
        // await Task.sync({force: true});

        console.log('The tables for Users, Tasks, and Weekdays have been (re)created.');
        
    } catch (err) {
        console.error(err.message);
    }

    try {
        await Promise.all([
            Weekday.findOrCreate({ where: { id:1 }, defaults: { id: 1, name: 'Monday' } }),
            Weekday.findOrCreate({ where: { id: 2}, defaults: { id: 2, name: 'Tuesday' } }),
            Weekday.findOrCreate({ where: { id: 3}, defaults: { id: 3, name: 'Wednesday' } }),
            Weekday.findOrCreate({ where: { id: 4}, defaults: { id: 4, name: 'Thursday' } }),
            Weekday.findOrCreate({ where: { id: 5}, defaults: { id: 5, name: 'Friday' } }),
            Weekday.findOrCreate({ where: { id: 6}, defaults: { id: 6, name: 'Saturday' } }),
            Weekday.findOrCreate({ where: { id: 7}, defaults: { id: 7, name: 'Sunday' } })
        ]);
    } catch (err) {
        console.error(err.message);
    }
}

init();


