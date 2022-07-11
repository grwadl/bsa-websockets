import {addClass, removeClass} from "../../../helpers/domHelper.mjs";
import {socket} from "../../../game.mjs";

export const leaveRoomHandler = () => {
    const roomsWrapper = document.querySelector('#rooms-page');
    const roomName = document.querySelector('#room-name').innerText;
    socket.emit('check_if_ready', roomName);
    const gameWrapper = document.querySelector('#game-page');
    addClass(gameWrapper, 'display-none');
    removeClass(roomsWrapper, 'display-none');
}