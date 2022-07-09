import {createElement} from "../../helpers/domHelper.mjs";

export const refreshRoomHandler = (room) => {
const roomToRefresh = document.querySelector(`[data-room-name='${room.room.name}']`);
    roomToRefresh.childNodes[1].innerText = room.room.members.length + ' connected';
    const userList = document.querySelector('#users-wrapper');
    userList.innerHTML = '';
    room.room.members.forEach(member => {
        const readyCircle = createElement({tagName: 'span', className: 'span-ready'});
        member.isReady ? readyCircle.classList.add('ready') : null;
        const userName = createElement({tagName: 'span', className: 'username'});
        userName.innerText = member.username;
        const item = createElement({tagName: 'div', className:'user-item', attributes: {'user-name': member.username}, innerElements: [userName, readyCircle] });
        userList.appendChild(item);
    });
}