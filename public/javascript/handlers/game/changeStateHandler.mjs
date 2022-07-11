import {socket} from "../../game.mjs";

export const changeStateClick = () => {
    const username = sessionStorage.getItem('username');
    const readyBtn = document.querySelector('#ready-btn');
    const userItemIsReady = document.querySelector(`.user-header [data-username='${username}']`);
    readyBtn.innerText = userItemIsReady.attributes[2].value === 'true' ? 'READY' : 'NOT READY';
    const roomName = document.querySelector('#room-name').innerText;
    socket.emit('change_state', roomName);
}