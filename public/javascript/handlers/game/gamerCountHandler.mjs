export const gamerCountHandler = time => {
    const gameTimer = document.querySelector('#game-timer-seconds');
    gameTimer.innerText = time;
}