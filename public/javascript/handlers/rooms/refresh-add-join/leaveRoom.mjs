import {socket} from "../../../game.mjs";
import {addClass, removeClass} from "../../../helpers/domHelper.mjs";

export const leaveRoom = () => {
    const nameOfRoom = document.querySelector('#room-name');
    socket.emit('leave_room', nameOfRoom.innerText);
    const roomsWrapper = document.querySelector('#rooms-page');
    const gameWrapper = document.querySelector('#game-page');
    addClass(gameWrapper, 'display-none');
    removeClass(roomsWrapper, 'display-none');
}