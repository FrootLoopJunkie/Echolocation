require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Client Connected');
    socket.join('mainPage')
    socket.on('newPost', (arg) => {
        console.log('Recieved:', arg);
        socket.to('mainPage').emit('newPost', arg);
    })
})

httpServer.listen(process.env.PORT, () => {
    console.log(`Now Listening On Port: ${process.env.PORT}`);
})