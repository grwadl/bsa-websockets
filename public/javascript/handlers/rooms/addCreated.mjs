import {appendRoomElement} from "../../views/room.mjs";
import {rooms} from "../../game.mjs";

export const onJoin = (name) => {
    rooms.emit('join_room', name)
}

export const addCreated = room => {
    appendRoomElement({name: room.name, numberOfUsers: room.members.length, onJoin})
}