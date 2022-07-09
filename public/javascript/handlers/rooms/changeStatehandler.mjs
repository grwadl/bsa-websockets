export const changeStateHandler = changedUser => {
    const userToChange = document.querySelector(`[user-name='${changedUser.username}']`);
    userToChange.childNodes[1].classList.toggle('ready');
}