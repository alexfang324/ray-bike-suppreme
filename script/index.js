'use strict';
import TwoPlayerGame from './two-player-game.js';

let difficulty = 'easy';

const loadGame = async () => {
  //set up start game button
  const startGameBtn = document.getElementById('start-game-btn');
  startGameBtn.addEventListener('click', () => {
    const openPageElement = document.getElementById('opening-page');
    openPageElement.style.display = 'none';
    const playerName1 = document.getElementById('name1').value;
    const playerName2 = document.getElementById('name2').value;

    new TwoPlayerGame(difficulty, playerName1, playerName2);
  });

  //set up selector handler to each difficulty button and choose 'easy' as default mode.
  const difficultyModes = Array.from(
    document.getElementById('difficulty-mode').children
  );
  difficultyModes[0].children[0].classList.add('active');
  difficultyModes.forEach((mode) => {
    mode.addEventListener('click', (event) => selectDifficultyMode(event));
  });
};

//unselect all diffulty mode and select the one clicked.
const selectDifficultyMode = (event) => {
  Array.from(document.getElementById('difficulty-mode').children).forEach(
    (element) => {
      element.children[0].classList.remove('active');
    }
  );
  event.target.classList.add('active');
  difficulty = event.target.getAttribute('value');
};

//Entry point for the game
window.addEventListener('DOMContentLoaded', () => {
  loadGame();
});
