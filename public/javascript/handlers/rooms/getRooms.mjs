import {appendRoomElement} from "../../views/room.mjs";
import {onJoin} from "./addCreated.mjs";

export const getRoomsHandler = rooms => {
    rooms.length
        ? rooms.forEach(room => appendRoomElement({name: room.name, numberOfUsers: room.members.length, onJoin}))
        : console.log('no rooms :(')
}