import {createElement, removeClass} from "../../helpers/domHelper.mjs";
import {socket} from "../../game.mjs";

const showText = (text, textWrapper) => {
    text.split('').forEach(symbol => {
        const span = createElement({tagName:'span'});
        span.innerText = symbol;
        textWrapper.appendChild(span);
    })
    removeClass(textWrapper, 'display-none');
    return text;
}

export const startGameHandler = id => {
    const textWrapper = document.querySelector('#text-container');
    let text;
    fetch(`http://localhost:3002/game/texts/${id}`)
        .then(res => res.json())
        .then(res => text = showText(res, textWrapper).split(''));
    let counter = 0;
    const roomName = document.querySelector('#room-name').innerText;
    const keyPressHandler = e => {
        if(e.key === text[counter]) {
            textWrapper.childNodes[counter].classList.add('green');
            socket.emit('pressed_key', {percentage: (counter)*100 / (text.length-1), roomName});
            counter++;
        }
        if(counter === text?.length) {
            console.log('sedg')
            document.removeEventListener('keypress', keyPressHandler)
            socket.emit('finished_game', roomName);
        }
    }
    document.addEventListener('keypress', keyPressHandler);

}