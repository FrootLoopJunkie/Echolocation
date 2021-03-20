const socket = io();
const inputField = document.querySelector('#inputField');
const feedContainer = document.querySelector('#feedContainer');
const userCount = document.querySelector('#userCount');
const roomCount = document.querySelector('#roomCount');
const currentRoom = document.querySelector('#currentRoom');
const appName = document.querySelector('#appName');

let currentRoomName = '#home';

socket.on('connect', () => {
    console.log(`Connected`);
    currentRoom.innerHTML = `Current Room: #home`
})

appName.addEventListener('click', () => {
    location.reload();
})

inputField.addEventListener('keypress', (e) => {
    let input = inputField.value; 
    if(e.keyCode === 13 && input.trim()){
        e.preventDefault();       
        socket.emit('newPost', input, currentRoomName);
        newPost(input);
        inputField.value = "";
    }
    $('.hashtag').click((e) =>{
        if(e.target.textContent !== currentRoomName){
            let target = e.target.textContent;
            socket.emit('roomRequest', target);
        }
    })  
})

socket.on('statCount', (arg1, arg2) => {
    userCount.innerHTML = `-- Total Connected Clients: ${arg1} --`;
    roomCount.innerHTML = `-- Chat Rooms Open: ${arg2} --`;
})

socket.on('initialPosts', (arg) =>{
    if(arg.rows !== undefined || document.querySelector('.post')){
        let posts = [...arg.rows];
        posts = posts.reverse();
        posts.forEach((elem) => {
            newPost(elem.post_contents);
        })
    }
    $('.hashtag').click((e) =>{
        if(e.target.textContent !== currentRoomName){
            let target = e.target.textContent;
            socket.emit('roomRequest', target);
        }
    })  
})

socket.on('newPost', (arg, socketid) => {
    if(socketid === socket.id){
        return;
    }
    newPost(arg.post_body);
    $('.hashtag').click((e) =>{
        if(e.target.textContent !== currentRoomName){
            let target = e.target.textContent;
            socket.emit('roomRequest', target);
        }
    })  
})

socket.on('joinedRoom', (arg1, arg2) => {
    if(arg1 === '#home'){
        location.reload();
        return;
    }
    currentRoom.innerHTML = `Current Room: ${arg1}`
    currentRoomName = arg1;
    inputField.value = arg1;
    $("#feedContainer").empty();
    if(arg2 !== null){
        const posts = arg2.rows; 
        posts.forEach((elem) => {
            newPost(elem.post_contents);
        })
    }
    $('.hashtag').click((e) =>{
        if(e.target.textContent !== currentRoomName){
            let target = e.target.textContent;
            socket.emit('roomRequest', target);
        }
    })  
})

function newPost(arg){

    const regx = /#(\w+)\b/ig;
    const hashtags = arg.match(regx);
    if(hashtags !== null){
        hashtags.forEach((elem) => {
            let hashtag = `<span class=hashtag>${elem}</span>`;
            arg = arg.replace(elem, hashtag)
        })
    }

    let postContainer = document.createElement('div')
    let user = document.createElement('span');
    user.setAttribute('class', 'user');
    let postBody = document.createElement('span')
    postBody.setAttribute('class', 'postBody');
    let username = genUsername();
    user.innerHTML = `${username}: `;
    postBody.innerHTML = arg.post_body || arg;
    postContainer.append(user);
    postContainer.append(postBody);
    postContainer.setAttribute('class', 'post');
    feedContainer.prepend(postContainer);
}

function genUsername(){
    names = ['Nameless','Undisclosed','Unidentified','Unnamed','Innominate','Anonymous','Undubbed','Unknown']
    const username = names[random(names.length)]
    return username;
}

function random(num){
    return Math.floor(Math.random() * num)
}
