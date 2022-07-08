import {wrongUsernameHandler} from "./handlers/login/wrongUsernameHandler.mjs";
import {getRoomsHandler} from "./handlers/rooms/getRooms.mjs";
import {addCreated} from "./handlers/rooms/addCreated.mjs";
import {createRoom} from "./handlers/rooms/createRoom/createRoom.js";
import {joinRoomHandler} from "./handlers/rooms/joinRoom.mjs";

const username = sessionStorage.getItem('username');

if (!username) {
	window.location.replace('/login');
}

const socket = io('http://localhost:3002', { query: { username } });
const login = io('http://localhost:3002/login');
export const rooms = io('http://localhost:3002/rooms');

const buttonCreate = document.querySelector('#add-room-btn');
buttonCreate.addEventListener('click', createRoom)

login.on('error_username', wrongUsernameHandler);
rooms.on('get_rooms', getRoomsHandler);
rooms.on('add_room', addCreated)
rooms.on('join_room_done', joinRoomHandler);

