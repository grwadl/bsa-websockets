import {showInputModal} from "../../../views/modal.mjs";
import {rooms} from "../../../game.mjs";
const onCreate = () => {
    const input = document.querySelector('.modal-input');
    console.log(input)
    rooms.emit('add_room', input.value);
}
export const createRoom = () => showInputModal({title:'create room', onSubmit:onCreate})