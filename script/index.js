'use strict';
import Game from './game.js';

//Parameters
let difficulty = 'easy';

//html Elements
const openingPageElement = document.getElementById('opening-page');
const gamePageElement = document.getElementById('game-page');
const gameOverPageElement = document.getElementById('game-over-page');
const startGameBtn = document.getElementById('start-game-btn');
const difficultyModes = Array.from(
  document.getElementById('difficulty-mode').children
);
const inputElement1 = document.getElementById('name1');
const inputElement2 = document.getElementById('name2');

//Summary: wire up opening page default options and event listener
function renderOpeningPage() {
  //set up start game button
  startGameBtn.addEventListener('click', startGame);

  //set up selector handler to each difficulty button and choose 'easy' as default mode.
  difficultyModes[0].children[0].classList.add('active');
  difficultyModes.forEach((mode) => {
    mode.addEventListener('click', (event) => selectDifficultyMode(event));
  });
}

//Summary: unselect all diffulty mode and select the one clicked.
//Input: click event of the mode selected
function selectDifficultyMode(event) {
  event.preventDefault();
  //unselect all modes
  difficultyModes.forEach((element) => {
    element.children[0].classList.remove('active');
  });
  //select the mode clicked
  event.target.classList.add('active');
  difficulty = event.target.getAttribute('value');
}

//Summary: load game page and start game
function startGame() {
  //get input player names
  const playerName1 = inputElement1.value;
  const playerName2 = inputElement2.value;
  if (!playerName1) {
    inputElement1.classList.add('empty-input');
    inputElement1.placeholder = "This can't be empty";
  }
  if (!playerName2) {
    inputElement2.classList.add('empty-input');
    inputElement2.placeholder = "This can't be empty";
  }
  if (playerName1 && playerName2) {
    //hide opening page and show game page
    openingPageElement.setAttribute('hidden', 'true');
    gamePageElement.removeAttribute('hidden');
    //clear input field
    inputElement1.classList.remove('empty-input');
    inputElement2.classList.remove('empty-input');
    inputElement1.value = '';
    inputElement2.value = '';
    //start game
    new Game(difficulty, playerName1, playerName2, renderGameOverPage);
  }
}

//Summary:hide gameplay screen and construct game over screen
const renderGameOverPage = (player1, player2, winningPlayer, score) => {
  //calculate and display stats for each player
  const winnerNameElement = document.getElementById('winner-name');
  const winnerScoreElement = document.getElementById('winner-score');
  if (winningPlayer) {
    winnerNameElement.innerHTML = `The winner is:<br/>${winningPlayer.name}`;
    winnerScoreElement.innerHTML = `You scored ${score} points!`;
  } else {
    winnerNameElement.innerHTML = 'This was an even game!';
    winnerScoreElement.innerHTML = '';
  }

  const statsBoardElement = document.getElementById('score-stats');
  statsBoardElement.innerHTML = `<p></p><p>${player1.name}</p>
  <p>${player2.name}
  </p><p>Best Score</p>
  <p>${player1.bestScore}</p>
  <p>${player2.bestScore}</p>
  <p>Accumulated Score</p>
  <p>${player1.accumulatedScore}</p>
  <p>${player2.accumulatedScore}</p>`;

  //switch screen
  gamePageElement.setAttribute('hidden', 'true');
  gameOverPageElement.removeAttribute('hidden');
};

//Entry point for the game
document.addEventListener('DOMContentLoaded', () => {
  renderOpeningPage();
});
