import {wrongUsernameHandler} from "./handlers/login/wrongUsernameHandler.mjs";
import {getRoomsHandler} from "./handlers/rooms/refresh-add-join/getRooms.mjs";
import {addCreated} from "./handlers/rooms/refresh-add-join/addCreated.mjs";
import {createRoom} from "./handlers/rooms/createRoom/createRoom.mjs";
import {joinRoomHandler} from "./handlers/rooms/refresh-add-join/joinRoom.mjs";
import {refreshRoomHandler} from "./handlers/rooms/refresh-add-join/refreshRoomHandler.mjs";
import {leaveRoom} from "./handlers/rooms/refresh-add-join/leaveRoom.mjs";
import {leaveRoomHandler} from "./handlers/rooms/refresh-add-join/leaveRoomHandler.mjs";
import {changeStateHandler} from "./handlers/rooms/changeStatehandler.mjs";
import {startTimerHandler} from "./handlers/rooms/timer/startTimerHandler.mjs";
import {changeTimerHandler} from "./handlers/rooms/timer/changeTimerHandler.mjs";
import {hideRoomHandler} from "./handlers/rooms/refresh-add-join/hideRoomhandler.mjs";
import {startGameHandler} from "./handlers/game/getTextHandler.mjs";
import {setProgress} from "./views/user.mjs";
import {gamerCountHandler} from "./handlers/game/gamerCountHandler.mjs";
import {onCloseModal} from "./handlers/game/onCloseModal.mjs";
import {timeOverHandler} from "./handlers/game/timeOverhandler.mjs";
import {wrongRoomHandler} from "./handlers/rooms/createRoom/wrongRoomHandler.mjs";
import {changeStateClick} from "./handlers/game/changeStateHandler.mjs";

const username = sessionStorage.getItem('username');

if (!username) {
	window.location.replace('/login');
}

export const socket = io('https://bsa-websockets.herokuapp.com/', { query: { username } });


document.querySelector('.title').innerText += ` [Username: ${username}]`;

const buttonCreate = document.querySelector('#add-room-btn');
buttonCreate.addEventListener('click', createRoom);
const buttonLeave = document.querySelector('#quit-room-btn');
buttonLeave.addEventListener('click', leaveRoom);
const buttonReady = document.querySelector('#ready-btn');
buttonReady.addEventListener('click', changeStateClick);

socket.on('error_username', wrongUsernameHandler);
socket.on('get_rooms', getRoomsHandler);
socket.on('add_room', addCreated);
socket.on('join_room_done', joinRoomHandler);
socket.on('refresh_room_info', refreshRoomHandler);
socket.on('leave_room_done', leaveRoomHandler);
socket.on('change_state_done', changeStateHandler);
socket.on('timer_render', startTimerHandler);
socket.on('start_timer_count', changeTimerHandler);
socket.on('hide_room', hideRoomHandler);
socket.on('generated_id', startGameHandler);
socket.on('change_progressBar', setProgress);
socket.on('start_game_timer_count', gamerCountHandler);
socket.on('show_result', onCloseModal);
socket.on('time_is_over', timeOverHandler);
socket.on('wrong_name_room', wrongRoomHandler)
