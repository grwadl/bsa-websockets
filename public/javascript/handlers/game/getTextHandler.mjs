import {addClass, createElement, removeClass} from "../../helpers/domHelper.mjs";
import {socket} from "../../game.mjs";

const showText = (text, textWrapper) => {
    textWrapper.innerHTML = '';
    text.split('').forEach(symbol => {
        const span = createElement({tagName:'span'});
        span.innerText = symbol;
        textWrapper.appendChild(span);
    });
    textWrapper.firstChild.classList.add('next')
    removeClass(textWrapper, 'display-none');
    return text;
}

export let reference;

export const startGameHandler = id => {
    const textWrapper = document.querySelector('#text-container');
    let text;
    fetch(`http://localhost:3002/game/texts/${id}`)
        .then(res => res.json())
        .then(res => text = showText(res, textWrapper).split(''));
    let counter = 0;
    const roomName = document.querySelector('#room-name').innerText;
    const gameTimer = document.querySelector('#game-timer');
    removeClass(gameTimer, 'display-none');
    socket.emit('start_game_timer', roomName);
    reference = e => {
        console.log('click')
        if(e.key === text[counter]) {
            textWrapper.childNodes[counter].classList.add('green');
            textWrapper.childNodes[counter].classList.remove('next');
            socket.emit('pressed_key', {percentage: (counter+1)*100 / (text.length), roomName});
            counter++;
            textWrapper.childNodes[counter]?.classList.add('next');
        }
        if(counter === text?.length) {
            const seconds = document.querySelector('#game-timer-seconds').innerText;
            const charsPerSecond = text.length/(60-seconds);
            const charsWrapper = document.querySelector('.chars-per-second');
            removeClass(charsWrapper, 'display-none');
            charsWrapper.innerText = `${charsPerSecond} chars per second`
            document.removeEventListener('keypress', reference);
            const img = document.querySelector('.img-finished')
            removeClass(img, 'display-none');
            socket.emit('finished_game', roomName);
            textWrapper.innerHTML = '';
        }
    }
    document.addEventListener('keypress', reference);
}