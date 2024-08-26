const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origins: ['*']
  }
});
const PORT = 4000;

app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
    socket.on('addMessage', (data) => {
      console.log('Received message:', data);
      io.emit('addMessage', data); // new message
    });
  
    socket.on('editMessage', (data) => {
      console.log('Received edit message:', data);
      io.emit('editMessage', data); // edited message
    });
  
    socket.on('deleteMessage', (data) => {
      console.log('Received delete message:', data);
      io.emit('deleteMessage', data); // deleted message
    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

http.listen(PORT, () => {
  console.log(`listening on port : ${PORT}`);
});

