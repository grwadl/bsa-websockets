export const hideRoomHandler = roomName => {
    const roomWrapper = document.querySelector('#rooms-wrapper');
    const room = document.querySelector(`[data-room-name = '${roomName}']`);
    roomWrapper.removeChild(room);
}