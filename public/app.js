const socket = io();
const inputField = document.querySelector('#inputField');
const feedContainer = document.querySelector('#feedContainer');

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

socket.on('newPost', (arg) => {
    newPost(arg);
})

function newPost(arg){
    let p = document.createElement('p');
    p.innerHTML = arg;
    feedContainer.prepend(p);
}