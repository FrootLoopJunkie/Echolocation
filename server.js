require('dotenv').config();
const pool = require('./pg');
const express = require('express');
const app = express();
const morgan = require('morgan');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
//
let userCount = 0;
let roomCount = 0;
let roomArray = [];
let hashtagArray = [];

app.use(express.static('public'));

io.on('connection', async(socket) => {
    socket.join('#home');
    roomArray.push('#home');
    console.log(`Client ${socket.id} Connected`);
    // console.log('Updating Hashtag List');
    // try {
    //     const client = await pool.connect();
    //     const hashtags = await pool.query(`SELECT * FROM post_hashtags`); 
    //     console.log(hashtags.rows)
    //     client.release();
    // } catch (err) {
    //     console.error(err);
    // }
    userCount ++;
    try{
        const client = await pool.connect();
        const initialPosts = await pool.query('SELECT * FROM posts_public ORDER BY post_id DESC LIMIT 10');
        client.release();
        socket.emit('initialPosts', initialPosts);
        io.emit('statCount', userCount, roomCount);
    }catch(err){
        console.error(err);
    }
    socket.on('newPost', async(arg, arg2) => {
        try{
            console.log(socket.rooms);
            socket.to('#home').emit('newPost', {'post_body': arg});
            socket.broadcast.to(arg2).emit('newPost', {'post_body': arg});
            const client = await pool.connect();
            const privatePost = await pool.query(`INSERT INTO posts_private (post_contents, date_created, user_id) VALUES ('${arg}', null, '1'); SELECT currval(pg_get_serial_sequence('posts_private', 'post_id'))`); 
            const postID = privatePost[1].rows[0].currval;
            const publicPost = await pool.query(`INSERT INTO posts_public (post_id, post_contents, date_created) VALUES ('${postID}', '${arg}', null)`);
            const regx = /#(\w+)\b/ig;
            const hashtags = arg.match(regx);
            console.log('Hashtags: ' + hashtags);
            if(hashtags !== null){
                hashtags.forEach(async(elem) => {
                    console.log(`Adding ${elem} To DB`)
                    const hashtagInsert = await pool.query(`INSERT INTO post_hashtags (hashtag, post_id) VALUES ('${elem}', '${postID}')`); 
                    if(elem !== socket.id || elem !== arg2){
                        socket.broadcast.to(elem).emit('newPost', {'post_body': arg});
                    }
                    if(!hashtagArray.includes(elem)){
                        hashtagArray.push(elem);
                    }
                })
            }
            client.release();
        }catch(err){
            console.error(err);
        }
    })
    socket.on('roomRequest', async(arg) => {
        const roomTarget = arg.toLowerCase();
        if(!roomArray.includes(roomTarget)){
            console.log('Opening New Room: ' + roomTarget);
            roomCount++;
            roomArray.push(roomTarget);
        }
        socket.rooms.forEach((elem) =>{
            if(socket.id !== elem || socket.id !== roomTarget){
                socket.leave(elem)
            }
        })
        socket.join(roomTarget);
        socketsInRoom();
        try{
            const client = await pool.connect();
            const roomPosts = await pool.query(`SELECT * FROM post_hashtags INNER JOIN posts_public ON post_hashtags.post_id = posts_public.post_id WHERE post_hashtags.hashtag = '${arg}' LIMIT 10`);
            client.release();
            socket.emit(`joinedRoom`, roomTarget, roomPosts);
            io.emit('statCount', userCount, roomCount);
        }catch(err){
            console.error(err);
        }        
    })
    socket.on('disconnect', (reason) => {
        socketsInRoom();
        userCount --;
        io.emit('statCount', userCount, roomCount);
    })
})

httpServer.listen(process.env.PORT, () => {
    console.log(`Now Listening On Port: ${process.env.PORT}`);
})

function socketsInRoom(){
    roomArray.forEach((elem) =>{
        let room = io.sockets.adapter.rooms.get(elem);
        if(room === undefined){
            roomArray.splice(roomArray.indexOf(elem), 1)
            roomCount--;
        }
       
    })
}