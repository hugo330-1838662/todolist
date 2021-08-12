'use strict';

// web-server related stuff
const PORT = process.env.PORT || 3010;

const Koa = require('koa');
const Router = require('@koa/router');

const http = require('http');
const path = require('path');
const serve = require('koa-static');
const koaBody = require('koa-body');

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
// const Weekday = require(path.join(modelDirPath, 'Weekday.js'))(sequelize, DataTypes);

app.on('error', (err, ctx) => {
    console.error('Internal server error', err, ctx);
});

router.get('index', '/', (ctx) => {
    ctx.redirect('/index.html');
});

// router.get('singleDayTask', '/single-day/:day', async (ctx) => {
//     // ctx.body = 'To-do list for ' + ctx.params.day + '.';
//     // getTask(ctx);
//     let res;
//     if (ctx.params.day == -1) {
//         res = await Task.findAll({ attributes: ['dayId', 'taskName']});
//     } else {
//         res = await Task.findAll({
//             attributes: ['taskName'],
//             where: { dayId: ctx.params.day }
//         });
//     }
//     ctx.body = res;
// });

router.get('getTask', '/getTask', async (ctx) => {
    ctx.body = await Task.findAll({
        order: [
            ['complete', 'ASC'],
            ['dueDate', 'ASC'],
            ['dueTime', 'ASC']
        ]
    });
})

router.post('addTask', '/addTask', async (ctx) => {
    const bdy = ctx.request.body;
    if (bdy.dueDate == '') {
        bdy.dueDate = null;
    }
    if (bdy.dueTime == '') {
        bdy.dueTime = null;
    }
    console.log(bdy);
    ctx.body = await Task.create(bdy);
    ctx.redirect('/');
});

router.post('toggleComplete', '/toggle-complete', async (ctx) => {
    // ctx.body = await Task.update(
    //     { complete: 1 }, 
    //     { where: { id: ctx.request.body.taskId } }
    // );
    ctx.body = await Task.update(
        { complete: Sequelize.literal('NOT complete') }, 
        { where: { id: ctx.request.body.taskId } }
    );
    // ctx.redirect('/');
});

router.delete('deleteTask', '/delete/:id', async (ctx) => {
    ctx.body = await Task.destroy({
        where: {
            id: ctx.params.id
        }
    })

    // ctx.redirect('/');
    
});

app
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
        await User.hasMany(Task);
        // await User.sync({alter: true});
        // // await Weekday.sync({alter: true});
        // await Task.sync({alter: true});
        await sequelize.sync({ alter: true });
        
        console.log('The tables for Users, Tasks, and Weekdays have been (re)created.');
    } catch (err) {
        console.error(err.message);
    }

    http.createServer(app.callback()).listen(PORT, () => {
        console.log('server ready on', PORT);
    });
})()
// async function init() {

//     // Open db connection.
//     try {
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//     } catch (err) {
//         console.error('Unable to connect to database:', err);
//     }
//     http.createServer(app.callback()).listen(PORT, () => {
//         console.log('server ready.')
//     });
    
//     try {
//         await Task.belongsTo(Weekday, { foreignKey: 'dayId' });
//         await User.hasMany(Task);
//         await User.sync({alter: true});
//         // await Weekday.sync({alter: true});
//         await Task.sync({alter: true});
        
//         // await User.sync({force: true});
//         // await Weekday.sync({force: true});
//         // await Task.sync({force: true});

//         console.log('The tables for Users, Tasks, and Weekdays have been (re)created.');
        
//     } catch (err) {
//         console.error(err.message);
//     }

//     try {
//         await Promise.all([
//             Weekday.findOrCreate({ where: { id:1 }, defaults: { id: 1, name: 'Monday' } }),
//             Weekday.findOrCreate({ where: { id: 2}, defaults: { id: 2, name: 'Tuesday' } }),
//             Weekday.findOrCreate({ where: { id: 3}, defaults: { id: 3, name: 'Wednesday' } }),
//             Weekday.findOrCreate({ where: { id: 4}, defaults: { id: 4, name: 'Thursday' } }),
//             Weekday.findOrCreate({ where: { id: 5}, defaults: { id: 5, name: 'Friday' } }),
//             Weekday.findOrCreate({ where: { id: 6}, defaults: { id: 6, name: 'Saturday' } }),
//             Weekday.findOrCreate({ where: { id: 7}, defaults: { id: 7, name: 'Sunday' } })
//         ]);
//     } catch (err) {
//         console.error(err.message);
//     }
// }

// init();


