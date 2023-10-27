'use strict';
import Game from './game.js';
import Player from './player.js';
import Bike from './bike.js';
import Obstacle from './obstacle.js';
import { Direction, ObstacleType } from './enum.js';
import Projectile from './projectile.js';

export default class TwoPlayerGame extends Game {
  RAY_LIFETIME = 8000; //lifetime in miliseconds
  PROJ_SPEED = 10; //speed of projectile
  MIN_OBS_HEIGHT = 20; //minimum obstacle height in px;
  MAX_OBS_HEIGHT = 100; //max obstacle height in px;
  BIKE1_ID = 'bike1';
  INITIAL_BIKE1_DIR = Direction.right;
  INITIAL_BIKE1_IMG_POS = [250, 250];
  BIKE2_ID = 'bike2';
  INITIAL_BIKE2_DIR = Direction.left;
  INITIAL_BIKE2_IMG_POS = [650, 250];
  OBS_IMG_PATH = '../img/rock.jpg'; //image path of stationary obstacle
  PROJ_IMG_PATH = '../img/laser.png'; //image path of projectile

  difficulty; //game difficulty
  gamePageElement;
  gameOverPageElement;
  openingPageElement;
  playerName1;
  playerName2;
  score;
  projectiles = [];

  constructor(difficulty, playerName1, playerName2) {
    super();
    this.difficulty = difficulty;
    this.playerName1 = playerName1;
    this.playerName2 = playerName2;
    this.openingPageElement = document.getElementById('opening-page');
    this.gamePageElement = document.getElementById('game-page');
    this.gameOverPageElement = document.getElementById('game-over-page');

    const player1 = new Player(this.playerName1);
    this.players.push(player1);

    const player2 = new Player(this.playerName2);
    this.players.push(player2);

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
    this.gamePageElement.innerHTML = '';
    this.score = 0;
    this.GAME_START_TIME = Date.now();
    this.obstacles = [];

    this.setupScoreBoard(this.playerName1, this.playerName2);
    this.setupArena();

    const bike1Element = document.getElementById(this.BIKE1_ID);
    if (bike1Element) {
      bike1Element.remove();
    }
    const bike1 = new Bike(
      this.INITIAL_BIKE1_IMG_POS,
      this.INITIAL_BIKE1_DIR,
      this.BIKESPEED,
      this.BIKE1_ID,
      ['a', 'd', 'w'],
      '../img/shopping-cart.jpg',
      'rgb(188, 19, 254)',
      this.RAY_LIFETIME,
      this.emitProjectile
    );
    this.players[0].bike = bike1;

    const bike2Element = document.getElementById(this.BIKE2_ID);
    if (bike2Element) {
      bike2Element.remove();
    }
    const bike2 = new Bike(
      this.INITIAL_BIKE2_IMG_POS,
      this.INITIAL_BIKE2_DIR,
      this.BIKESPEED,
      this.BIKE2_ID,
      ['ArrowLeft', 'ArrowRight', 'ArrowUp'],
      '../img/green-bike.jpg',
      'rgb(57, 255, 20)',
      this.RAY_LIFETIME,
      this.emitProjectile
    );
    this.players[1].bike = bike2;

    this.setupCanvases();
    if (this.difficulty === 'medium') {
      this.addObstacles(4);
    } else if (this.difficulty === 'hard') {
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
    this.gamePageElement.appendChild(scoreBoardElement);
  };

  addObstacles = (numObstacles) => {
    //list of arena objects, e.g. bike, rock
    let arenaObjects = [...this.players.map((p) => p.bike.element)];

    //get variable obstacle height
    for (let i = 0; i < numObstacles; i++) {
      const obsHeight =
        this.MIN_OBS_HEIGHT +
        Math.random() * (this.MAX_OBS_HEIGHT - this.MIN_OBS_HEIGHT);

      //add obstacle onto arena with initial arena-relative position [0,0]
      const obsElement = document.createElement('img');
      obsElement.src = this.OBS_IMG_PATH;
      obsElement.classList.add('rock');
      obsElement.style.height = obsHeight + 'px';
      obsElement.style.top = '0px';
      obsElement.style.left = '0px';
      this.arena.appendChild(obsElement);

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
          const left = Math.random() * (this.ARENA_WIDTH - obsWidth);
          const top = Math.random() * (this.ARENA_HEIGHT - obsHeight);
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
            this.obstacles.push(
              new Obstacle(
                left,
                top,
                left + width,
                top,
                ObstacleType.rock,
                obsId,
                null,
                obsElement
              ),
              new Obstacle(
                left + width,
                top,
                left + width,
                top + height,
                ObstacleType.rock,
                obsId,
                null,
                obsElement
              ),
              new Obstacle(
                left,
                top + height,
                left + width,
                top + height,
                ObstacleType.rock,
                obsId,
                null,
                obsElement
              ),
              new Obstacle(
                left,
                top,
                left,
                top + height,
                ObstacleType.rock,
                obsId,
                null,
                obsElement
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
    const newScore = Math.round((Date.now() - this.GAME_START_TIME) / 100);
    this.score = newScore;
    const scoreElement = document.getElementById('player-score');
    scoreElement.textContent = `${newScore}`;
  };

  emitProjectile = (bike) => {
    this.projectiles.push(
      new Projectile(
        bike.centerPosition,
        bike.direction,
        this.PROJ_SPEED,
        this.PROJ_IMG_PATH
      )
    );
  };

  evolveGame = () => {
    const setGameInterval = setInterval(() => {
      //advance bike motion and update its trail on canvas
      this.players.forEach((player, i) => {
        const bike = player.bike;
        bike.moveForwardAndAddTrail();
        const obsToRemove = bike.removeExpiredTrail();
        this.eraseCanvasTrail(obsToRemove);
        this.drawCanvasTrail(i);
      });

      //add current bike trail to list of obstacle segments
      let updatedObstacles = [...this.obstacles];
      this.players.forEach((player) => {
        updatedObstacles = [
          ...updatedObstacles,
          ...player.bike.getTrailForCollisionCheck()
        ];
      });

      //advance projectile motion
      this.projectiles.forEach((proj) => {
        proj.moveForward(proj);
      });

      //increment score
      this.incrementScore();

      //check for collision with bikes
      this.checkBikeCollision(updatedObstacles, setGameInterval);

      //check for collision with laser
      this.checkProjectileCollision(updatedObstacles);
    }, 30);
  };

  checkBikeCollision = (updatedObstacles, setGameInterval) => {
    for (const player of this.players) {
      const hasCollided = updatedObstacles.map((obs) => {
        return player.bike.hasCollided(obs);
      });

      if (hasCollided.includes(true)) {
        clearInterval(setGameInterval);
        this.removeBikeEventListeners();
        const winnerInd = hasCollided.indexOf(false);
        this.players[winnerInd].updateScore(this.score);
        this.renderGameOverPage(this.players[winnerInd]);
        break;
      }
    }
  };

  checkProjectileCollision = (updatedObstacles) => {
    for (const obs of updatedObstacles) {
      this.projectiles.forEach((proj, i) => {
        if (proj.hasCollided(obs)) {
          //remove projectile object and its html element and handle collidee situation
          this.projectiles[i].element.remove();
          this.projectiles.splice(i, 1);
          this.handleProjectileCollision(obs);
        }
      });
    }
  };

  handleProjectileCollision(obstacle) {
    switch (obstacle.type) {
      case ObstacleType.wall:
        break;
      case ObstacleType.rock:
        //remove html element and the 4 obstacles object that forms the rock
        obstacle.element.remove();
        this.obstacles = this.obstacles.filter((obs) => obs.id != obstacle.id);
        break;
      case ObstacleType.trail:
        this.removeTrailFrom(obstacle);
        break;
      default:
        console.log('hit something');
        break;
    }
  }

  removeTrailFrom = (seg) => {
    const bikeId = seg.ownerId;
    const bike = this.players.filter((player) => {
      return player.bike.bikeId == bikeId;
    })[0].bike;
    const index = bike.trail.findIndex((trailSeg) => {
      return (
        trailSeg.x1 == seg.x1 &&
        trailSeg.x2 == seg.x2 &&
        trailSeg.y1 == seg.y1 &&
        trailSeg.y2 == seg.y2
      );
    });

    //extend the trail deletion further to allow the entire bike's width to pass through
    //without touch the trail
    const halfWidthOfWidestBike =
      Math.max(
        ...this.players.map((player) => {
          return player.bike.imgWidth;
        })
      ) / 2;

    const deletionIndex = index + halfWidthOfWidestBike / this.BIKESPEED;
    index + this.eraseCanvasTrail(bike.trail.slice(0, deletionIndex));
    bike.trail = bike.trail.slice(deletionIndex);
  };

  renderGameOverPage = (winningPlayer) => {
    //switch from game page to game over page and wire the buttons in game over page
    this.gamePageElement.setAttribute('hidden', 'true');
    this.gameOverPageElement.removeAttribute('hidden');

    //calculate and display stats to player
    document.getElementById('winner-name').innerHTML = `${winningPlayer.name}`;
    document.getElementById(
      'winner-score'
    ).innerHTML = `You scored ${this.score} points!`;

    const statsBoardElement = document.getElementById('score-stats');
    statsBoardElement.innerHTML = `<p></p><p>${this.players[0].name}</p>
    <p>${this.players[1].name}
    </p><p>Best Score</p>
    <p>${this.players[0].bestScore}</p>
    <p>${this.players[1].bestScore}</p>
    <p>Accumulated Score</p>
    <p>${this.players[0].accumulatedScore}</p>
    <p>${this.players[1].accumulatedScore}</p>`;
  };

  mainMenuBtnClicked = () => {
    this.openingPageElement.removeAttribute('hidden');
    this.gameOverPageElement.setAttribute('hidden', true);
  };

  playAgainBtnClicked = () => {
    this.gameOverPageElement.setAttribute('hidden', true);
    this.gamePageElement.removeAttribute('hidden');
    this.startFreshGame();
  };
}
