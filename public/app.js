const socket = io();
const inputField = document.querySelector('#inputField');
const feedContainer = document.querySelector('#feedContainer');
const userCount = document.querySelector('#userCount');

socket.on('connect', () => {
    console.log(`Connected`);
})

function inputFieldKeypress(){
    let key = window.event.keyCode;
    if(key === 13){
        socket.emit('newPost', inputField.value);
        newPost(inputField.value)
        inputField.value = "";
    }
}

socket.on('userCount', (arg) => {
    userCount.innerHTML = `Connected Clients: ${arg}`;
})

socket.on('newPost', (arg) => {
    newPost(arg);
})

function newPost(arg){
    let postContainer = document.createElement('div')
    let user = document.createElement('span');
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
    names = ['Gyges', 'Maudgalyayana', 'Gyfre', 'Faustus']
    const username = names[random(names.length)]
    console.log('test')
    return username;
}

function random(num){
    return Math.floor(Math.random() * num)
}