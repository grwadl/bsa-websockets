import {showResultsModal} from "../../views/modal.mjs";
import {addClass, removeClass} from "../../helpers/domHelper.mjs";

const onClose = () => {
    const gameTimer = document.querySelector('#game-timer');
    addClass(gameTimer, 'display-none');
    const buttonBack = document.querySelector('#quit-room-btn');
    const buttonToDelete = document.querySelector('#ready-btn');
    removeClass(buttonToDelete, 'display-none');
    removeClass(buttonBack, 'display-none');
}

export const onCloseModal = users => {
    document.querySelector('#text-container').innerText = '';
    showResultsModal({usersSortedArray: users, onClose});
}