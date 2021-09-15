const socket = io();
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const leaveButton = document.getElementById('leave-button')
const fallback = document.querySelector(".fallback");

let userName = ""

if (messageForm != null) {
  userName = prompt('What is your name?')
  appendMessage('You joined')
  socket.emit('new-user', roomName, userName)
  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', roomName, message)
    messageInput.value = ''
  })
}
if (messageInput != null) {
messageInput.addEventListener("keyup", () => {
  socket.emit("typing", {isTyping: messageInput.value.length > 0, userName});
});
}

if (leaveButton != null) {
    leaveButton.addEventListener('click', room =>{
      console.log('[socket]','disconnect :', room);
      socket.to(room).emit('disconnect', socket.id)
    })
}


socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

socket.on("typing", function (data) {
  const { isTyping, userName } = data;

  if (!isTyping) {
    fallback.innerHTML = "";
    return;
  }

  fallback.innerHTML = `<p>${userName} is typing...</p>`;
});



function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}