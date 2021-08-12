'use strict';



const GET_LIST_URL = 'getTask/';
const COMPLETE_TASK_URL = 'toggle-complete/';
const DELETE_TASK_URL = 'delete/';

window.addEventListener("load", init);

function init() {
    getToDoList();
    // id('monday').addEventListener('click', clickFunction);
    // id('tuesday').addEventListener('click', clickFunction);
    // id('wednesday').addEventListener('click', clickFunction);
    // id('thursday').addEventListener('click', clickFunction);
    // id('friday').addEventListener('click', clickFunction);
    // id('saturday').addEventListener('click', clickFunction);
    // id('sunday').addEventListener('click', clickFunction);
    // id('all_week').addEventListener('click', clickFunction);
}

function deleteTask() {
    let url = DELETE_TASK_URL + this.closest('li').id;
    console.log(url);
    fetch(url, {
        method: 'DELETE'
    })
    .then(checkStatus)
    .then( () => {
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
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ "taskId": this.closest('li').id })
    })
    .then(checkStatus)
    .then(() => {
        window.location.reload();
        return false;
    })
    .catch(console.err);
    
}

function getToDoList() {
    //let url = GET_LIST_URL + el.textContent; // if no params needed in request url
    fetch(GET_LIST_URL)
    .then(checkStatus)
    .then(JSON.parse)
    .then( (res) => {
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
            }
            taskBox.id = task.id;
            name.textContent = 'Task Name: ' + task.taskName;
            note.textContent = task.note? 'Note: ' + task.note : '';
            date.textContent = task.dueDate? 'Due date: ' + task.dueDate : 'No due date';
            time.textContent = task.dueTime? 'Due time: ' + task.dueTime : 'No due tiem';
            
            dButton.textContent = 'Delete Task';
            cButton.textContent = task.complete? 'Mark as Incomplete' : 'Mark As Complete';
            
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
            task.dueDate? dueTasks.appendChild(taskBox) : undueTasks.appendChild(taskBox);
        }
        // let tdlist = document.createElement('p');
        // tdlist.textContent = res;
        id('dueTasks').appendChild(dueTasks);
        id('undueTasks').appendChild(undueTasks);
    })
    .catch(console.log);
    
}

function removeCurrentList() {
    while(id('to-do-list').firstChild) {
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