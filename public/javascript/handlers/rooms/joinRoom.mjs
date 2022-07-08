import {updateNumberOfUsersInRoom} from "../../views/room.mjs";

export const joinRoomHandler = room => {
    updateNumberOfUsersInRoom({name: room.room.name, numberOfUsers: room.room.members.length});
}