import {showMessageModal} from "../../views/modal.mjs";

const onClose = () => {
    window.location.replace('/login');
    sessionStorage.removeItem('username');
}

export const wrongUsernameHandler = () => {
    showMessageModal({message: 'such user already exists', onClose })
}