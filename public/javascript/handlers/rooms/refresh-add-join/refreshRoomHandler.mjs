
import {appendUserElement, setProgress} from "../../../views/user.mjs";
import {updateNumberOfUsersInRoom} from "../../../views/room.mjs";
import {removeClass} from "../../../helpers/domHelper.mjs";
import {socket} from "../../../game.mjs";

const memberRefresher = member => {
    const username = sessionStorage.getItem('username');
    appendUserElement({username: member.username, ready: member.isReady, isCurrentUser: username.toString() === member.username.toString()});
    setProgress({username: member.username, progress: member.percent})
}

export const refreshRoomHandler = (room) => {
    updateNumberOfUsersInRoom({name: room.room.name, numberOfUsers: room.room.members.length});
    const roomItem = document.querySelector(`[data-room-name='${room.room.name}']`);
    removeClass(roomItem, 'display-none');
    const userList = document.querySelector('#users-wrapper');
    const roomName = document.querySelector('#room-name').innerText;
    socket.emit('check_if_ready', roomName);
    userList.innerHTML = '';
    room.room.members.forEach(member => memberRefresher(member));
}