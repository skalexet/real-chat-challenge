const messages = document.querySelector('.messages');
const messageForm = document.querySelector('.message-form');
const roomName = document.querySelector('.room-name');
const userNames = document.querySelector('.user-names');

const socket = io();

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.emit('joinRoom', { username, room });

socket.on('message', message => {
    pushTheMessage(message);
});

socket.on('roomUsers', ({ room, users }) => {
    showUsers(users);
    showRoomName(room);
})

messageForm.addEventListener('submit', e => {
    e.preventDefault();

    const message = e.target.elements.msgfield.value;

    socket.emit('chatMessage', message);

    e.target.elements.msgfield.value = '';
    e.target.elements.msgfield.focus();
});


function pushTheMessage(message) {
    const div = document.createElement('div');
    div.className = 'message-container';
    div.innerHTML = `
        <h4>${message.username}</h4>
        <p>${message.text}</p>
        <span>${message.time}</span>
    `;

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function showUsers(users) {
    userNames.innerHTML = `
        ${users.map(user => `<p>${user.username}</p>`).join('')}
    `;
}

function showRoomName(room) {
    roomName.innerText = room;
}
