'use strict';

const SESSION_INFO_URL = 'get-session-status/'

window.addEventListener("load", init);


async function init() {
    console.log('current cookie >>>>> ', document.cookie);
    const user = await fetch(SESSION_INFO_URL)
        .then(checkStatus)
        .then(JSON.parse)
        .catch(console.err);
    console.log('Current session >>>>> ', user);
    id('message-box').textContent = user.message || '';
}


// helper
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