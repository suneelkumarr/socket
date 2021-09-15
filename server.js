const express = require('express');
const cors = require('cors')
const morgan = require("morgan");
const app = express();
const server = require('http').createServer(app)
const port = process.env.PORT || 4000;
const io = require("socket.io")(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    },
});
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.use(express.json());
app.use(cors())
app.use(morgan("common"));

let rooms = {}
const typers = {}

app.get('/',(req,res)=>{ 
    res.render('index', { rooms: rooms })
});

app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
      return res.redirect('/')
    }
    rooms[req.body.room] = { users: {} }
    res.redirect(req.body.room)
    // Send message that new room was created
    io.emit('room-created', req.body.room)
  });


app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
      return res.redirect('/')
    }
    res.render('room', { roomName: req.params.room })
  })


io.on('connect', (socket) => {
    console.log('user is connected');
    socket.on('new-user', (room, name) => {
        socket.join(room)
        rooms[room].users[socket.id] = name
        socket.to(room).emit('user-connected', name)
      })
      socket.on('send-chat-message', (room, message) => {
        socket.to(room).emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
      })

      socket.on('disconnect', (room) => {
        socket.leave(room);
        console.log('user is disconnected');
        getUserRooms(socket).forEach(room => {
          socket.to(room).emit('user-disconnected', rooms[room].users[socket.id])
          delete rooms[room].users[socket.id]
        })
      })
})

app.get('/use',(req, res) => {
    res.send('chat app conected')
})

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
      if (room.users[socket.id] != null) names.push(name)
      return names
    }, [])
  }

server.listen(port,() => {
    console.log(`Server is running on ${port} `);
});