import {showMessageModal} from "../../../views/modal.mjs";

export const wrongRoomHandler = () => {
    showMessageModal({message:'such room already exists'})
}