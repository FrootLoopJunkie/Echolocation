require('dotenv').config();
const pool = require('./pg');
const express = require('express');
const app = express();
const morgan = require('morgan');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

let userCount = 0;

app.use(express.static('public'));

io.on('connection', async(socket) => {
    console.log('Client Connected');
    userCount ++;
    const client = await pool.connect();
    const initialPosts = await pool.query('SELECT * FROM posts_public ORDER BY post_id DESC LIMIT 10');
    console.log(initialPosts.rows)
    client.release();
    socket.emit('initialPosts', initialPosts);
    io.emit('userCount', userCount);
    socket.on('newPost', async(arg) => {
        try{
            console.log('Recieved:', arg);
            socket.broadcast.emit('newPost', {'post_body': arg});
            const client = await pool.connect();
            const privatePost = await pool.query(`INSERT INTO posts_private (post_contents, date_created, user_id) VALUES ('${arg}', null, '1'); SELECT currval(pg_get_serial_sequence('posts_private', 'post_id'))`); 
            const postID = privatePost[1].rows[0].currval;
            const publicPost = await pool.query(`INSERT INTO posts_public (post_id, post_contents, date_created) VALUES ('${postID}', '${arg}', null)`);
            client.release();
        }catch(err){
            console.error(err);
        }
    })
    socket.on('disconnect', (reason) => {
        userCount --;
        io.emit('userCount', userCount);
    })
})

httpServer.listen(process.env.PORT, () => {
    console.log(`Now Listening On Port: ${process.env.PORT}`);
})