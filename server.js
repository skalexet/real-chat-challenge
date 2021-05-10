const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { userJoin, getUser, userLeave, getRoomUsers } = require('./utilities/users');
const formatMessage = require('./utilities/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat Bot';

io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${username} has joined the chat`))

        socket.emit('message', formatMessage(botName, `Hi ${username}! Welcome to chat`));
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', message => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, message));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    })
});


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
