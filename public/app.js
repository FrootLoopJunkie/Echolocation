const socket = io();
const inputField = document.querySelector('#inputField')

socket.on('connect', () => {
    console.log(`Connected`);
})

function inputFieldKeypress(){
    let key = window.event.keyCode;
    if(key === 13){
        socket.emit('newPost', inputField.value);
        inputField.value = "";
    }
}

socket.on('newPost', () => {
    
})