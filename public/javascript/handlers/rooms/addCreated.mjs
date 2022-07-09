import {appendRoomElement} from "../../views/room.mjs";
import {socket} from "../../game.mjs";

export const onJoin = (name) => {
    socket.emit('join_room', name)
}

export const addCreated = room => {
    appendRoomElement({name: room.name, numberOfUsers: room.members.length, onJoin});
}