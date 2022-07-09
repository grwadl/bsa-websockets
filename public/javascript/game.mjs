import {wrongUsernameHandler} from "./handlers/login/wrongUsernameHandler.mjs";
import {getRoomsHandler} from "./handlers/rooms/getRooms.mjs";
import {addCreated} from "./handlers/rooms/addCreated.mjs";
import {createRoom} from "./handlers/rooms/createRoom/createRoom.js";
import {joinRoomHandler} from "./handlers/rooms/joinRoom.mjs";
import {refreshRoomHandler} from "./handlers/rooms/refreshRoomHandler.mjs";
import {leaveRoom} from "./handlers/rooms/leaveRoom.js";
import {leaveRoomHandler} from "./handlers/rooms/leaveRoomHandler.js";

const username = sessionStorage.getItem('username');

if (!username) {
	window.location.replace('/login');
}

export const socket = io('http://localhost:3002', { query: { username } });

const buttonCreate = document.querySelector('#add-room-btn');
buttonCreate.addEventListener('click', createRoom);
const buttonLeave = document.querySelector('#quit-room-btn');
buttonLeave.addEventListener('click', leaveRoom)

socket.on('error_username', wrongUsernameHandler);
socket.on('get_rooms', getRoomsHandler);
socket.on('add_room', addCreated);
socket.on('join_room_done', joinRoomHandler);
socket.on('refresh_room_info', refreshRoomHandler);
socket.on('leave_room_done', leaveRoomHandler);

