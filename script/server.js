//подключение библиотеки WebSocket
const WebSocket = require('ws');

//создание веб-сокет сервера
const socket = new WebSocket.WebSocketServer({ port: 8080 });
//список подключенных клиентов
let clients = [];

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

//обработчик события подключения нового клиента
socket.on("connection", (client) => {
    let id = Math.ceil(Math.random() * Math.pow(10, 10));
    clients[id] = client;

    console.log(id + ' client connected');

    //обработчик события получения нового сообщения
    client.on('message', (event) => {
        let message = JSON.parse(event.toString('utf-8'));
        let response = CreateMessage(1, message.text, id, message.username, message.time, message.command);

        for (let clientId in clients) {
            if (clientId == id) response.userId = 0;
            else response.userId = id;
            clients[clientId].send(JSON.stringify(response));
        }
    });

    //обработчик события отключения клиента
    client.on('close', () => {
        console.log(id + ' client disconnected');
        delete clients[id];
    })
});