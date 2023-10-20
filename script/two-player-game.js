'use strict';
import Game from './game.js';
import Player from './player.js';
import Bike from './bike.js';
import Obstacle from './obstacle.js';
import { Direction, ObstacleType } from './enum.js';
import Projectile from './projectile.js';

export default class TwoPlayerGame extends Game {
  _RAY_LIFETIME = 2000; //lifetime in miliseconds
  _PROJ_SPEED = 10; //speed of projectile
  _MIN_OBS_HEIGHT = 20; //minimum obstacle height in px;
  _MAX_OBS_HEIGHT = 100; //max obstacle height in px;
  _BIKE1_ID = 'bike1';
  _INITIAL_BIKE1_DIR = Direction.right;
  _INITIAL_BIKE1_IMG_POS = [250, 250];
  _BIKE2_ID = 'bike2';
  _INITIAL_BIKE2_DIR = Direction.left;
  _INITIAL_BIKE2_IMG_POS = [650, 250];
  _OBS_IMG_PATH = '../img/rock.jpg'; //image path of stationary obstacle
  _PROJ_IMG_PATH = '../img/laser.png'; //image path of projectile

  _difficulty; //game difficulty
  _gamePageElement;
  _gameOverPageElement;
  _openingPageElement;
  _playerName1;
  _playerName2;
  _score;
  _projectiles = [];

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
    document
      .getElementById('main-menu-btn')
      .addEventListener('click', this.mainMenuBtnClicked);

    document
      .getElementById('play-again-btn')
      .addEventListener('click', this.playAgainBtnClicked);

    this.startFreshGame();
  }

  startFreshGame = () => {
    //reset parameters and elements
    this._gamePageElement.innerHTML = '';
    this._score = 0;
    this._GAME_START_TIME = Date.now();
    this._obstacles = [];
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
      ['a', 'd', 'w'],
      '../img/shopping-cart.jpg',
      'rgb(188, 19, 254)',
      this._RAY_LIFETIME,
      this.emitProjectile
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
      ['ArrowLeft', 'ArrowRight', 'ArrowUp'],
      '../img/green-bike.jpg',
      'rgb(57, 255, 20)',
      this._RAY_LIFETIME,
      this.emitProjectile
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
            const obsId = Math.random();
            this._obstacles.push(
              new Obstacle(
                left,
                top,
                left + width,
                top,
                ObstacleType.rock,
                obsId
              ),
              new Obstacle(
                left + width,
                top,
                left + width,
                top + height,
                ObstacleType.rock,
                obsId
              ),
              new Obstacle(
                left,
                top + height,
                left + width,
                top + height,
                ObstacleType.rock,
                obsId
              ),
              new Obstacle(
                left,
                top,
                left,
                top + height,
                ObstacleType.rock,
                obsId
              )
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

  emitProjectile = (bike) => {
    this._projectiles.push(
      new Projectile(
        bike.getCenterPosition(),
        bike.getDirection(),
        this._PROJ_SPEED,
        this._PROJ_IMG_PATH
      )
    );
  };

  evolveGame = () => {
    const setGameInterval = setInterval(() => {
      //advance bike motion and update its trail on canvas
      this._players.forEach((player, i) => {
        const bike = player.getBike();
        bike.moveForwardAndAddTrail();
        const obsToRemove = bike.removeExpiredTrail();
        this.eraseCanvasTrail(obsToRemove, i);
        this.drawCanvasTrail(i);
      });

      //add current bike trail to list of obstacle segments
      let updatedObstacles = [...this._obstacles];
      this._players.forEach((player) => {
        updatedObstacles = [
          ...updatedObstacles,
          ...player.getBike().getTrailForCollisionCheck()
        ];
      });

      //advance projectile motion
      this._projectiles.forEach((proj) => {
        proj.moveForward(proj);
      });

      //increment score
      this.incrementScore();

      //check for collision with bikes
      this._checkBikeCollision(updatedObstacles, setGameInterval);

      //check for collision with laser
      this._checkProjectileCollision(updatedObstacles);
    }, 30);
  };

  _checkBikeCollision = (updatedObstacles, setGameInterval) => {
    for (const player of this._players) {
      const hasCollided = updatedObstacles.map((obs) => {
        return player.getBike().hasCollided(obs);
      });

      if (hasCollided.includes(true)) {
        clearInterval(setGameInterval);
        this.removeBikeEventListeners();
        const winnerInd = hasCollided.indexOf(false);
        this._players[winnerInd].updateScore(this._score);
        this.renderGameOverPage(this._players[winnerInd]);
        break;
      }
    }
  };

  _checkProjectileCollision = (updatedObstacles) => {
    for (const obs of updatedObstacles) {
      this._projectiles.forEach((proj, i) => {
        if (proj.hasCollided(obs)) {
          //remove projectile from array and handle collidee
          this._projectiles.splice(i, 1);
          this._handleProjectileCollision(obs);
        }
      });
    }
  };

  _handleProjectileCollision(obstacle) {
    switch (obstacle.type) {
      case ObstacleType.wall:
        console.log('wall');
        break;
      default:
        console.log('hit something');
        break;
    }
  }

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

  mainMenuBtnClicked = () => {
    this._openingPageElement.removeAttribute('hidden');
    this._gameOverPageElement.setAttribute('hidden', true);
  };

  playAgainBtnClicked = () => {
    this._gameOverPageElement.setAttribute('hidden', true);
    this._gamePageElement.removeAttribute('hidden');
    this.startFreshGame();
  };
}
