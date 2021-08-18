'use strict';



const GET_LIST_URL = 'getTask/';
const COMPLETE_TASK_URL = 'toggle-complete/';
const DELETE_TASK_URL = 'delete/';
const LOGIN_URL = 'login/'
const USER_INFO_URL = 'get-session-status/'

window.addEventListener("load", init);

async function init() {
    console.log('current cookie >>>>> ', document.cookie);
    const user = await fetch(USER_INFO_URL)
        .then(checkStatus)
        .then(JSON.parse)
        .catch(console.err);
    console.log('current user >>>>>', user);
    id('username').textContent = user.name || 'You are not logged in.';
    if (user.id) {
        id('login-button').classList.add('hidden');
        id('logout-button').classList.remove('hidden');
        id('add-item').classList.remove('hidden');
        const input = document.createElement('input');
        input.setAttribute('name', 'UserId');
        input.setAttribute('value', user.id);
        input.setAttribute('type', 'hidden');
        id('add-task-form').appendChild(input);

        getToDoList(user.id);
    } else {
        id('login-button').classList.remove('hidden');
        id('logout-button').classList.add('hidden');
        id('add-item').classList.add('hidden');
    }
    // id('tdlist').classList.remove('hidden');

    // console.log('<%= Session["name"] %>');

    id('login-button').addEventListener('click', () => {
        window.location.assign('/login');
    });
    id('logout-button').addEventListener('click', () => {
        window.location.assign('/logout');
    });

    // if (getCookie('userid') == '') {
    //     id('login-button').textContent = 'login';
    //     id('login-button').addEventListener('click', () => {
    //         window.location.assign('/login');
    //     });
    // } else {
    //     id('username').textContent = getCookie('username');
    //     id('login-button').textContent = 'logout';
    //     id('login-button').removeEventListener('click', () => {
    //         window.location.assign('/logout');
    //     });

    // }
    // if (getCookie('userid') == '') {
    //     // id('login-button').textContent = 'login';
    //     // id('login-button').addEventListener('click', userLogin);
    //     id('tdlist').classList.add('hidden');
    //     id('login-box').classList.remove('hidden');
    // } else {
    //     id('tdlist').classList.remove('hidden');
    //     id('login-box').classList.add('hidden');
    //     // id('username').textContent = getCookie('username');
    //     // id('login-button').textContent = 'logout';
    //     // id('login-button').removeEventListener('click', userLogin);
    // }
    // id('login-button').addEventListener('click', userLogin);
    // id('tdlist').classList.remove('hidden');
    // id('login-box').classList.add('hidden');
    // getToDoList();
}



function deleteTask() {
    let url = DELETE_TASK_URL + this.closest('li').id;
    console.log(url);
    fetch(url, {
        method: 'DELETE'
    })
        .then(checkStatus)
        .then(() => {
            window.location.reload();
            return false;
        })
        .catch(console.err);
}

function toggleCompleteTask() {
    let url = COMPLETE_TASK_URL; // + this.closest('li').id;
    // console.log(JSON.stringify({ 'taskID': this.closest('li').id }));
    // console.log(this.closest('li').id);
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "taskId": this.closest('li').id })
    })
        .then(checkStatus)
        .then(() => {
            window.location.reload();
            return false;
        })
        .catch(console.err);

}

function getToDoList(userId) {
    let url = GET_LIST_URL + userId;
    fetch(url)
        .then(checkStatus)
        .then(JSON.parse)
        .then((res) => {
            // console.log(res);
            const dueTasks = document.createElement('ul');
            const undueTasks = document.createElement('ul');
            dueTasks.classList.add('task-list');
            undueTasks.classList.add('task-list');
            for (let task of res) {
                const taskBox = document.createElement('li');
                const name = document.createElement('div');
                const note = document.createElement('div');
                const date = document.createElement('div');
                const time = document.createElement('div');
                const dButton = document.createElement('button')
                const cButton = document.createElement('button');
                taskBox.classList.add('card');
                note.classList.add('note');
                dButton.classList.add('taskButton');
                cButton.classList.add('taskButton');
                if (task.complete) {
                    taskBox.classList.add('completed');
                } else {
                    taskBox.classList.remove('completed');
                }
                taskBox.id = task.id;
                name.textContent = 'Task Name: ' + task.taskName;
                note.textContent = task.note ? 'Note: ' + task.note : '';
                date.textContent = task.dueDate ? 'Due date: ' + task.dueDate : 'No due date';
                time.textContent = task.dueTime ? 'Due time: ' + task.dueTime : 'No due time';

                dButton.textContent = 'Delete Task';
                cButton.textContent = task.complete ? 'Mark as Incomplete' : 'Mark As Complete';

                dButton.addEventListener('click', deleteTask);
                cButton.addEventListener('click', toggleCompleteTask);
                taskBox.appendChild(name);
                if (task.dueDate) {
                    taskBox.appendChild(date);
                    taskBox.appendChild(time);
                }
                taskBox.appendChild(note);
                taskBox.appendChild(cButton);
                taskBox.appendChild(dButton);
                task.dueDate ? dueTasks.appendChild(taskBox) : undueTasks.appendChild(taskBox);
            }
            // let tdlist = document.createElement('p');
            // tdlist.textContent = res;
            id('dueTasks').appendChild(dueTasks);
            id('undueTasks').appendChild(undueTasks);
        })
        .catch(console.log);

}

function removeCurrentList() {
    while (id('to-do-list').firstChild) {
        id('to-do-list').removeChild(id('to-do-list').firstChild);
    }

}

// Helper functions.
function id(name) {
    return document.getElementById(name);
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300 || response.status == 0) {
        return response.text();
    } else {
        return Promise.reject(new Error(response.status + ": " + response.statusText));
    }
}

function setCookie(cname, cvalue) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// function checkCookie() {
//     let username = getCookie("username");
//     if (username != "") {
//         alert("Welcome again " + username);
//     } else {
//         username = prompt("Please enter your name:", "");
//         if (username != "" && username != null) {
//             setCookie("username", username, 365);
//         }
//     }
// }