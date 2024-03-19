//создание веб-сокет подключения
const wsocket = new WebSocket('ws://localhost:8080');
//id клиента
let userId = 0;


const modalShowBtn = document.getElementById('show-modal-button');
modalShowBtn.click();

//создание объекта сообщения
function CreateMessage(code, text, userId, username, time, command) {
    return {
        response: code, //код результата
        text: text, //текст сообщения
        userId: userId, //id клиента
        username: username, //имя клиента
        time: time, //время отправки сообщения
        command: command, //команда
    };
}

const saveUsernameBtn = document.getElementById('save-username-button');
let username = '';
saveUsernameBtn.addEventListener('click', () => {
    const newUsername = document.getElementById('message-username');
    if (newUsername.value == "") return;

    username = newUsername.value;

    let response = CreateMessage(null, null, null, username, null, 'JOIN');
    wsocket.send(JSON.stringify(response));
    modalShowBtn.click();
})


//обработчик события получения нового сообщения
wsocket.onmessage = function (event) {
    let message = JSON.parse(event.data);
    let messageBox = document.getElementsByClassName('message-box')[0];

    //отключение
    if (message.command == 'LEAVE') {
        if (message.username == '') return;

        messageBox.insertAdjacentHTML('beforeend',
            '<div class="container-fluid join-title text-primary mb-3 w-100 text-center p-0">'
            + 'Пользователь <b>' + message.username + '</b> покинул чат'
            + '</div>')
    }

    //подключение
    if (message.command == 'JOIN') {
        userId = message.userId;

        messageBox.insertAdjacentHTML('beforeend',
            '<div class="container-fluid join-title text-primary mb-3 w-100 text-center p-0">'
            + 'Пользователь <b>' + message.username + '</b> присоединился к чату'
            + '</div>')
    }

    //текстовое сообщение
    if (message.command == 'SEND') {
        messageBox.insertAdjacentHTML('beforeend',
            '<div class="container-fluid d-flex flex-row p-0 mb-2">'
            + '<div class="message-item d-flex flex-column rounded-4 px-3 py-2 mb-2">'
            + '<span class="message-title p-0 fw-bold text-primary">'
            + message.username
            + '</span>'
            + '<span class="message-text text-break p-0">'
            + message.text
            + '</span>'
            + '<span class="send-time fw-lighter w-100 text-end p-0">'
            + message.time
            + '</span>'
            + '</div>'
            + '</div>');

        if (message.userId == 0) {
            const messages = document.getElementsByClassName('message-item');
            let newMessage = messages[messages.length - 1].parentElement;
            newMessage.classList.add('justify-content-end');
        }
    }

    messageBox.scrollTo(0, messageBox.scrollHeight);
}

//обработчик события отправки сообщения
const sendBtn = document.getElementById('send-button');
sendBtn.addEventListener('click', () => {
    const messageText = document.getElementById('message-text');
    if (messageText.value == "") return;

    let message = CreateMessage(null, messageText.value, userId, username, new Date().getHours() + ':' + new Date().getMinutes(), 'SEND');
    wsocket.send(JSON.stringify(message));
    messageText.value = "";
})

//обработчик события закрытия вкладки
window.onunload = function () {
    let response = CreateMessage(null, null, null, username, null, 'LEAVE');
    wsocket.send(JSON.stringify(response));
    wsocket.close();
}