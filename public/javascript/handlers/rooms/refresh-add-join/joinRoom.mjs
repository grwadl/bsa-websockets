import {updateNumberOfUsersInRoom} from "../../../views/room.mjs";
import {addClass, removeClass} from "../../../helpers/domHelper.mjs";

export const joinRoomHandler = room => {
    updateNumberOfUsersInRoom({name: room.room.name, numberOfUsers: room.room.members.length});
    const roomsWrapper = document.querySelector('#rooms-page');
    const gameWrapper = document.querySelector('#game-page');
    const nameOfRoom = document.querySelector('#room-name');
    nameOfRoom.innerText = room.room.name;
    addClass(roomsWrapper, 'display-none');
    removeClass(gameWrapper, 'display-none');
}