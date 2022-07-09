import {removeClass} from "../../helpers/domHelper.mjs";

const showText = text => {
    const textWrapper = document.querySelector('#game-timer');
    textWrapper.innerText = text;
    removeClass(textWrapper, 'display-none');
}

export const getTextHandler = id => {
    fetch(`http://localhost:3002/game/texts/${id}`)
        .then(res => res.json())
        .then(res => showText(res));
}