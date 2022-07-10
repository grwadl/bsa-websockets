import {showResultsModal} from "../../views/modal.mjs";
import {addClass, removeClass} from "../../helpers/domHelper.mjs";
import {socket} from "../../game.mjs";
import {changeReadyStatus, setProgress} from "../../views/user.mjs";

const onClose = () => {
    const gameTimer = document.querySelector('#game-timer');
    addClass(gameTimer, 'display-none');
    const buttonBack = document.querySelector('#quit-room-btn');
    const buttonToDelete = document.querySelector('#ready-btn');
    removeClass(buttonToDelete, 'display-none');
    removeClass(buttonBack, 'display-none');
}

const resetUser = ({username, isReady}) => {
    changeReadyStatus({username, ready: isReady});
    setProgress({username, progress: 0})
}

export const onCloseModal = users => {
    const roomName = document.querySelector('#room-name').innerText;
    document.querySelector('#text-container').innerText = '';
    const usersSortedArray = users.map(item => item.username);
    showResultsModal({usersSortedArray, onClose});
    socket.emit('change_state', roomName);
    users.forEach(user => resetUser(user))
}