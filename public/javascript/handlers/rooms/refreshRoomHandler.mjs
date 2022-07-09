
import {appendUserElement} from "../../views/user.mjs";
import {updateNumberOfUsersInRoom} from "../../views/room.mjs";

export const refreshRoomHandler = (room) => {
    updateNumberOfUsersInRoom({name: room.room.name, numberOfUsers: room.room.members.length});
    const userList = document.querySelector('#users-wrapper');
    userList.innerHTML = '';
    room.room.members.forEach(member => appendUserElement({username: member.username, ready: member.isReady, isCurrentUser: false}));
}