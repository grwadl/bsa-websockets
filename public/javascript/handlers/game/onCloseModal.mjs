import {showResultsModal} from "../../views/modal.mjs";
import {addClass, removeClass} from "../../helpers/domHelper.mjs";
import {socket} from "../../game.mjs";
import {changeReadyStatus, setProgress} from "../../views/user.mjs";
import {reference} from "./getTextHandler.mjs";

const onClose = () => {
    const gameTimer = document.querySelector('#game-timer');
    gameTimer.childNodes[0].innerText = '60';
    const img = document.querySelector('.img-finished')
    addClass(img, 'display-none');
    addClass(gameTimer, 'display-none');
    const buttonBack = document.querySelector('#quit-room-btn');
    const charsWrapper = document.querySelector('.chars-per-second');
    addClass(charsWrapper, 'display-none');
    const buttonToDelete = document.querySelector('#ready-btn');
    removeClass(buttonToDelete, 'display-none');
    removeClass(buttonBack, 'display-none');
    const readyBtn = document.querySelector('#ready-btn');
    readyBtn.innerText = 'READY';
}

const resetUser = ({username, isReady}) => {
    changeReadyStatus({username, ready: isReady});
    setProgress({username, progress: 0})
}

export const onCloseModal = users => {
    document.removeEventListener('keypress', reference);
    const roomName = document.querySelector('#room-name').innerText;
    document.querySelector('#text-container').innerText = '';
    const usersSortedArray = users.map(item => item.username);
    showResultsModal({usersSortedArray, onClose});
    socket.emit('change_state_false', roomName);
    users.forEach(user => resetUser(user))
}