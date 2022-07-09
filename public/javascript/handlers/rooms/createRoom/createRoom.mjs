import {showInputModal} from "../../../views/modal.mjs";
import {socket} from "../../../game.mjs";
const onCreate = () => {
    const input = document.querySelector('.modal-input');
    socket.emit('add_room', input.value);
}
export const createRoom = () => showInputModal({title:'create room', onSubmit:onCreate})