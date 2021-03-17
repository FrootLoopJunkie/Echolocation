const socket = io();
const inputField = document.querySelector('#inputField');
const feedContainer = document.querySelector('#feedContainer');
const userCount = document.querySelector('#userCount');
const roomCount = document.querySelector('#roomCount');

socket.on('connect', () => {
    console.log(`Connected`);
})

inputField.addEventListener('keypress', (e) => {
    if(e.keyCode === 13){
        e.preventDefault();
        socket.emit('newPost', inputField.value);
        newPost(inputField.value)
        inputField.value = "";
    }
})

socket.on('userCount', (arg) => {
    userCount.innerHTML = `-- Connected Clients: ${arg} --`;
    roomCount.innerHTML = `-- Chat Rooms Open: 0 --`;
})

socket.on('initialPosts', (arg) =>{
    if(arg.rows !== undefined || document.querySelector('.post')){
        let posts = [...arg.rows];
        posts = posts.reverse();
        posts.forEach((elem) => {
            newPost(elem.post_contents);
        })
    }
})

socket.on('newPost', (arg) => {
    newPost(arg);
})

function newPost(arg){
    let postContainer = document.createElement('div')
    let user = document.createElement('span');
    user.setAttribute('class', 'user');
    let postBody = document.createElement('span')
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