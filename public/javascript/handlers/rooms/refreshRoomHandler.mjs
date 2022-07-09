export const refreshRoomHandler = (room) => {
const roomToRefresh = document.querySelector(`[data-room-name='${room.room.name}']`);
    roomToRefresh.childNodes[1].innerText = room.room.members.length + ' connected';
}