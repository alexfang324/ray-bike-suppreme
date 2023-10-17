'use strict';
import Game from './game.js';
import Player from './player.js';
import Bike from './bike.js';
import Direction from './direction_enum.js';

export default class TwoPlayerGame extends Game {
  _RAY_LIFETIME = 10000; //lifetime in miliseconds
  _MIN_OBS_HEIGHT = 20; //minimum obstacle height in px;
  _MAX_OBS_HEIGHT = 100; //max obstacle height in px;
  _BIKE1_ID = 'bike1';
  _INITIAL_BIKE1_DIR = Direction.right;
  _INITIAL_BIKE1_IMG_POS = [250, 250];
  _BIKE2_ID = 'bike2';
  _INITIAL_BIKE2_DIR = Direction.left;
  _INITIAL_BIKE2_IMG_POS = [650, 250];
  _OBS_IMG_PATH = '../img/rock.jpg';

  _difficulty; //game difficulty
  _gamePageElement;
  _gameOverPageElement;
  _openingPageElement;
  _playerName1;
  _playerName2;
  _score;

  constructor(difficulty, playerName1, playerName2) {
    super();
    this._difficulty = difficulty;
    this._playerName1 = playerName1;
    this._playerName2 = playerName2;
    this._openingPageElement = document.getElementById('opening-page');
    this._gamePageElement = document.getElementById('game-page');
    this._gameOverPageElement = document.getElementById('game-over-page');

    const player1 = new Player(this._playerName1);
    this._players.push(player1);

    const player2 = new Player(this._playerName2);
    this._players.push(player2);

    //wire up game-over page buttons
    document.getElementById('main-menu-btn').addEventListener('click', () => {
      this._openingPageElement.removeAttribute('hidden');
      this._gameOverPageElement.setAttribute('hidden', true);
    });

    document.getElementById('play-again-btn').addEventListener('click', () => {
      this._gameOverPageElement.setAttribute('hidden', true);
      this._gamePageElement.removeAttribute('hidden');
      this.startFreshGame();
    });

    this.startFreshGame();
  }

  startFreshGame = () => {
    //reset parameters and elements
    this._gamePageElement.innerHTML = '';
    this._score = 0;
    this._GAME_START_TIME = Date.now();
    this._obsSegments = [];
    this._trailCanvases = [];

    this.setupScoreBoard(this._playerName1, this._playerName2);
    this.setupArena();

    const bike1Element = document.getElementById(this._BIKE1_ID);
    if (bike1Element) {
      bike1Element.remove();
    }
    const bike1 = new Bike(
      this._INITIAL_BIKE1_IMG_POS,
      this._INITIAL_BIKE1_DIR,
      this._BIKESPEED,
      this._BIKE1_ID,
      ['a', 'd'],
      '../img/shopping-cart.jpg',
      'rgb(188, 19, 254)',
      this._RAY_LIFETIME
    );
    this._players[0].setBike(bike1);

    const bike2Element = document.getElementById(this._BIKE2_ID);
    if (bike2Element) {
      bike2Element.remove();
    }
    const bike2 = new Bike(
      this._INITIAL_BIKE2_IMG_POS,
      this._INITIAL_BIKE2_DIR,
      this._BIKESPEED,
      this._BIKE2_ID,
      ['ArrowLeft', 'ArrowRight'],
      '../img/green-bike.jpg',
      'rgb(57, 255, 20)',
      this._RAY_LIFETIME
    );
    this._players[1].setBike(bike2);

    this.setupCanvases();
    if (this._difficulty === 'medium') {
      this.addObstacles(4);
    } else if (this._difficulty === 'hard') {
      this.addObstacles(8);
    }
    this.setupBikeEventListeners();
    this.evolveGame();
  };

  setupScoreBoard = (playerName1, playerName2) => {
    const scoreBoardElement = document.createElement('div');
    scoreBoardElement.classList.add('score-board');
    scoreBoardElement.innerHTML = `<div><p class="label">Player 1</p>
    <p class="player-name">${playerName1}</p></div>
    <p id="player-score">0</p><div><p class="label">Player 2</p>
    <p class="player-name">${playerName2}</p></div>`;
    this._gamePageElement.appendChild(scoreBoardElement);
  };

  addObstacles = (numObstacles) => {
    //list of arena objects, e.g. bike, rock
    let arenaObjects = [...this._players.map((p) => p.getBike().getElement())];

    //get variable obstacle height
    for (let i = 0; i < numObstacles; i++) {
      const obsHeight =
        this._MIN_OBS_HEIGHT +
        Math.random() * (this._MAX_OBS_HEIGHT - this._MIN_OBS_HEIGHT);

      //add obstacle onto arena with initial arena-relative position [0,0]
      const obsElement = document.createElement('img');
      obsElement.src = this._OBS_IMG_PATH;
      obsElement.classList.add('rock');
      obsElement.style.height = obsHeight + 'px';
      obsElement.style.top = '0px';
      obsElement.style.left = '0px';
      this._arena.appendChild(obsElement);

      obsElement.onload = () => {
        const obsWidth = parseFloat(
          obsElement.getBoundingClientRect().width.toFixed(4)
        );

        let attempts = 20;
        while (attempts) {
          let overlap = false;
          attempts -= 1;

          //arena relative position
          //randomly place an obstacle and make sure it's not on top of another obstacle
          const left = Math.random() * (this._ARENA_WIDTH - obsWidth);
          const top = Math.random() * (this._ARENA_HEIGHT - obsHeight);
          obsElement.style.top = top + 'px';
          obsElement.style.left = left + 'px';
          const obsRect = obsElement.getBoundingClientRect();

          for (const obj of arenaObjects) {
            const objRect = obj.getBoundingClientRect();
            overlap = this.checkImageOverlap(obsRect, objRect);
            if (overlap) {
              break;
            }
          }
          //add boundaries of the obstacle if no overlap is found and also update twoDObstacle array
          if (!overlap) {
            const width = obsRect.width;
            const height = obsRect.height;
            arenaObjects.push(obsElement);
            this._obsSegments.push(
              [left, top, left + width, top],
              [left + width, top, left + width, top + height],
              [left, top + height, left + width, top + height],
              [left, top, left, top + height]
            );
            break;
          }
        }
      };
    }
  };

  //Summary: check if two rectangular image html elements overlap
  //overlap is true when a corner of an image 1 is within both the x-range
  //and y-range of image 2.
  //Input: inputs are DOMRect objects that are return from calling getBoundingClientRect()
  //       on an html element
  checkImageOverlap(rect1, rect2) {
    const minX1 = rect1.left;
    const maxX1 = rect1.left + rect1.width;
    const minY1 = rect1.top;
    const maxY1 = rect1.top + rect1.height;
    const minX2 = rect2.left;
    const maxX2 = rect2.left + rect2.width;
    const minY2 = rect2.top;
    const maxY2 = rect2.top + rect2.height;

    const inXRange =
      (minX2 > minX1 && minX2 < maxX1) || (maxX2 > minX1 && maxX2 < maxX1);

    const inYRange =
      (minY2 > minY1 && minY2 < maxY1) || (maxY2 > minY1 && maxY2 < maxY1);
    return inXRange && inYRange;
  }

  incrementScore = () => {
    const newScore = Math.round((Date.now() - this._GAME_START_TIME) / 100);
    this._score = newScore;
    const scoreElement = document.getElementById('player-score');
    scoreElement.textContent = `${newScore}`;
  };

  evolveGame = () => {
    const gameInterval = setInterval(() => {
      this._players.forEach((player, i) => {
        player.getBike().moveForward();
        this.drawTrail(i);
      });

      //add current bike trail to list of obstacle segments
      let updatedObsSegs = [...this._obsSegments];

      this._players.forEach((player) => {
        updatedObsSegs = [...updatedObsSegs, ...player.getBike().getTrail()];
      });

      //increment score
      this.incrementScore();

      //check for collision
      for (const seg of updatedObsSegs) {
        const hasCollided = this._players.map((player) => {
          return player.getBike().hasCollided(seg);
        });

        if (hasCollided.includes(true)) {
          clearInterval(gameInterval);
          window.removeEventListener('keydown', this.updateBikeDirection);
          const winnerInd = hasCollided.indexOf(false);
          this._players[winnerInd].updateScore(this._score);
          this.renderGameOverPage(this._players[winnerInd]);
          break;
        }
      }
    }, 30);
  };

  renderGameOverPage = (winningPlayer) => {
    //switch from game page to game over page and wire the buttons in game over page
    this._gamePageElement.setAttribute('hidden', 'true');
    this._gameOverPageElement.removeAttribute('hidden');

    //calculate and display stats to player
    document.getElementById(
      'winner-name'
    ).innerHTML = `${winningPlayer.getName()}`;
    document.getElementById(
      'winner-score'
    ).innerHTML = `You scored ${this._score} points!`;

    const statsBoardElement = document.getElementById('score-stats');
    statsBoardElement.innerHTML = `<p></p><p>${this._players[0].getName()}</p>
    <p>${this._players[1].getName()}
    </p><p>Best Score</p>
    <p>${this._players[0].getBestScore()}</p>
    <p>${this._players[1].getBestScore()}</p>
    <p>Accumulated Score</p>
    <p>${this._players[0].getAccumulatedScore()}</p>
    <p>${this._players[1].getAccumulatedScore()}</p>`;
  };
}
