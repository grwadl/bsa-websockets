import {socket} from "../../game.mjs";

export const timeOverHandler = () => {
    const roomName = document.querySelector('#room-name').innerText;
    socket.emit('ready_to_show_result', roomName)
}