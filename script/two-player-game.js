'use strict';
import Game from './game.js';
import Player from './player.js';
import Bike from './bike.js';
import Direction from './direction_enum.js';

export default class TwoPlayerGame extends Game {
  _difficulty; //game difficulty
  _minObsHeight = 20; //minimum obstacle height in px;
  _maxObsHeight = 100; //max obstacle height in px;
  _obsImgPath = '../img/rock.jpg';

  constructor(difficulty, playerName1, playerName2) {
    super();
    this._difficulty = difficulty;
    this.setupScoreBoard(playerName1, playerName2);
    this.setupArena();

    const bike1 = new Bike(
      [this._ARENA_CEN_POS[0] + 200, this._ARENA_CEN_POS[1]],
      Direction.left,
      this._BIKESPEED,
      'bike1',
      '../img/green-bike.jpg',
      'rgb(57, 255, 20)',
      ['ArrowLeft', 'ArrowRight']
    );
    const player1 = new Player(playerName1, bike1);
    this._players.push(player1);

    const bike2 = new Bike(
      [this._ARENA_CEN_POS[0] - 200, this._ARENA_CEN_POS[1]],
      Direction.right,
      this._BIKESPEED,
      'bike2',
      '../img/shopping-cart.jpg',
      'rgb(188, 19, 254)',
      ['a', 'd']
    );
    const player2 = new Player(playerName2, bike2);
    this._players.push(player2);

    this.setupCanvases();
    if (difficulty === 'medium') {
      this.addObstacles(5);
    }
    this.setupEventListeners();
    this.evolveGame();
  }

  setupScoreBoard = (playerName1, playerName2) => {
    const rootElement = document.getElementById('game-page');
    const scoreBoardElement = document.createElement('div');
    scoreBoardElement.classList.add('score-board');
    scoreBoardElement.innerHTML = `<div><p class="label">Player 1</p>
    <p class="player-name">${playerName1}</p></div>
    <p id="player-score">0</p><div><p class="label">Player 2</p>
    <p class="player-name">${playerName2}</p></div>`;
    rootElement.appendChild(scoreBoardElement);
  };

  addObstacles = (numObstacles) => {
    //list of arena objects, e.g. bike, rock
    let arenaObjects = [...this._players.map((p) => p.getBike().getElement())];

    //get variable obstacle height
    for (let i = 0; i < numObstacles; i++) {
      const obsHeight =
        this._minObsHeight +
        Math.random() * (this._maxObsHeight - this._minObsHeight);

      //add obstacle onto arena with initial arena-relative position [0,0]
      const obsElement = document.createElement('img');
      obsElement.src = this._obsImgPath;
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
          GameOverPage(this._players[winnerInd]);
        }
      }
    }, 30);
  };

  GameOverPage = () => {};
}
