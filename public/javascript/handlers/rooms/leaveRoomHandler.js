import {addClass, removeClass} from "../../helpers/domHelper.mjs";

export const leaveRoomHandler = () => {
    const roomsWrapper = document.querySelector('#rooms-page');
    const gameWrapper = document.querySelector('#game-page');
    addClass(gameWrapper, 'display-none');
    removeClass(roomsWrapper, 'display-none');
}