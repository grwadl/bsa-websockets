import {socket} from "../../../game.mjs";
import {addClass, removeClass} from "../../../helpers/domHelper.mjs";

export const startTimerHandler = () => {
    const name = document.querySelector('#room-name').innerText;
    socket.emit('start_timer', name);
    const buttonBack = document.querySelector('#quit-room-btn');
    const buttonToDelete = document.querySelector('#ready-btn');
    const timer = document.querySelector('#timer');
    timer.innerText = '';
    removeClass(timer, 'display-none')
    addClass(buttonToDelete, 'display-none');
    addClass(buttonBack, 'display-none');

}