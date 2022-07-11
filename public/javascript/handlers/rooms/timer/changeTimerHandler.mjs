import {addClass} from "../../../helpers/domHelper.mjs";
import {socket} from "../../../game.mjs";


export const changeTimerHandler = number => {
    const timer = document.querySelector('#timer');
    timer.innerText = Number(number) === Number(timer.innerText) ? timer.innerText : number;
    if(number === 0) {
        const timer = document.querySelector('#timer');
        addClass(timer, 'display-none');
        const roomName = document.querySelector('#room-name').innerText;
        socket.emit('choose_id', roomName);
    }
}