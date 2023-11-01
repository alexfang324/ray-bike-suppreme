'use strict';
import TwoPlayerGame from './two-player-game.js';

//Parameters
let difficulty = 'easy';

//html Elements
const openingPageElement = document.getElementById('opening-page');
const startGameBtn = document.getElementById('start-game-btn');
const difficultyModes = Array.from(
  document.getElementById('difficulty-mode').children
);
const inputElement1 = document.getElementById('name1');
const inputElement2 = document.getElementById('name2');
const gamePageElement = document.getElementById('game-page');

//wire up opening page default options and event listener
function loadGame() {
  //set up start game button
  startGameBtn.addEventListener('click', startGame);

  //set up selector handler to each difficulty button and choose 'easy' as default mode.
  difficultyModes[0].children[0].classList.add('active');
  difficultyModes.forEach((mode) => {
    mode.addEventListener('click', (event) => selectDifficultyMode(event));
  });
}

//unselect all diffulty mode and select the one clicked.
function selectDifficultyMode(event) {
  difficultyModes.forEach((element) => {
    element.children[0].classList.remove('active');
  });
  event.target.classList.add('active');
  difficulty = event.target.getAttribute('value');
}

//load game page and start the selected game
function startGame() {
  openingPageElement.setAttribute('hidden', 'true');
  gamePageElement.removeAttribute('hidden');
  const playerName1 = inputElement1.value;
  const playerName2 = inputElement2.value;
  inputElement1.value = '';
  inputElement2.value = '';

  new TwoPlayerGame(difficulty, playerName1, playerName2);
}

//Entry point for the game
document.addEventListener('DOMContentLoaded', () => {
  loadGame();
});
