'use strict';

const Router = require('@koa/router');
const router = new Router();

// default display index.html
router.get('index', '/', (ctx) => {
    ctx.redirect('/index.html');
});

router.get('singleDayTask', '/single-day/:day', (ctx) => {
    ctx.body = 'To-do list for ' + ctx.params.day + '.';
    // getTask(ctx);
    if (ctx.params.day == -1) {
        Task.findAll({ attributes: ['dayId', ['taskName', 'Task Name']]})
            .then((res) => {
                console.log(JSON.stringify(res));
            });
    } else {
        Task.findAll({
            attributes: [['taskName', 'Task Name']],
            where: { dayId: ctx.params.day}
        })
            .then((res) => {
                console.log(JSON.stringify(res));
            });
    }
});

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

module.exports = router;