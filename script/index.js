import TwoPlayerGame from './two-player-game.js';

const getOpeningPage = async () => {
  const startGameBtn = document.getElementById('start-game-btn');
  startGameBtn.addEventListener('click', () => {
    const openPageElement = document.getElementById('opening-page');
    openPageElement.style.display = 'none';
    new TwoPlayerGame();
  });
};

//Entry point for the game
window.addEventListener('DOMContentLoaded', () => {
  getOpeningPage();
});
