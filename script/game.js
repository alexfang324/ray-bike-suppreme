'use strict';
import Player from './player.js';
import Bike from './bike.js';
import Obstacle from './obstacle.js';
import { Direction, ObstacleType } from './enum.js';
import Projectile from './projectile.js';

export default class Game {
  /////////////////////////////////////////////////////////////////////////////////
  //CLASS CONSTANTS AND VARIABLES
  /////////////////////////////////////////////////////////////////////////////////

  //GAME-RELATED CONSTANT
  GAME_REFRESH_RATE = 30; //miliseconds to wait before advance the game by one game loop
  MED_LEVEL_OBS_NUM = 4; //number of rock obstacles for medium difficulty
  HARD_LEVEL_OBS_NUM = 8; //number of rock obstacles for hard difficulty
  MIN_OBS_HEIGHT = 20; //minimum pixel height or rock obstacle
  MAX_OBS_HEIGHT = 100; //maximum pixel height or rock obstacle
  OBS_IMG_PATH = '../img/rock.jpg'; //image path of stationary obstacle
  PROJ_IMG_PATH = '../img/laser.png'; //image path of projectile

  //ARENA-RELATED CONSTANTS
  ARENA_WIDTH = 900; //pixel width of gameplay arena
  ARENA_HEIGHT = 450; //pixel height of gameplay arena
  ARENA_GRID_X_NUM = 15; //number of horizontal arena background grid lines
  ARENA_GRID_Y_NUM = 8; //number of vertical arena background grid lines

  //BIKE-RELATED CONSTANT
  RAYWIDTH = 3; //pixel width of ray trail
  RAY_LIFETIME = 8000; //milisecond lifetime of ray trail
  NUM_PROJ = 5; //number of projectile a bike can emit
  BIKESPEED = 3; //pixel distance bike will move per game loop iteration
  PROJ_SPEED = 20; //pixel distance projectile will move per game loop iteration
  BIKE1_ID = 'bike1';
  BIKE1_IMG = '../img/red-bike.jpg';
  BIKE1_CONTROL = ['a', 'd', 'w']; //[turn-left, emit-projectile, turn-right] keys for bike1
  BIKE1_TRAIL_COLOR = 'rgb(188, 19, 254)';
  INITIAL_BIKE1_DIR = Direction.right;
  INITIAL_BIKE1_IMG_POS = [150, 180]; //left and top position of bike1
  BIKE2_ID = 'bike2';
  BIKE2_IMG = '../img/green-bike.jpg';
  BIKE2_CONTROL = ['ArrowLeft', 'ArrowRight', 'ArrowUp']; //[turn-left, emit-projectile, turn-right] keys for bike1
  BIKE2_TRAIL_COLOR = 'rgb(57, 255, 20)';
  INITIAL_BIKE2_DIR = Direction.left;
  INITIAL_BIKE2_IMG_POS = [750, 180]; //left and top position of bike2

  //Game-related Properties
  difficulty; //game difficulty
  isRunning = false; //boolean to indicate the status of the game
  gameStartTime; //record the timestamp when we enter the main game loop for the first time
  lastTimestamp; //record last timestamp used for requestAnimateFrame of the main game loop
  animFrameId; //requestAnimationFrame id for the main game loop
  winningPlayer; //tracks the winning player object
  playerName1;
  playerName2;
  score; //score of the current game
  projectiles = []; //array of projectile-type Obstacle instances in the arena
  arenaElement; // html div element representing the arena
  players = []; //array of players in the game
  obstacles = []; //array of Obstacle instances in the arena (not including bike trails)

  //DOM-related Properties
  openingPageElement;
  gamePageElement;
  gameHeaderElement;
  projRowElement; //div element that contains projectile box with icon for each player
  gameOverPageElement;
  trailCanvasElement; //canvas html elements

  /////////////////////////////////////////////////////////////////////////////////
  //CONSTRUCTOR
  /////////////////////////////////////////////////////////////////////////////////
  constructor(difficulty, playerName1, playerName2) {
    //initializing properties and objects that will not change during the lifetime of the game
    this.difficulty = difficulty;
    this.playerName1 = playerName1;
    this.playerName2 = playerName2;
    this.openingPageElement = document.getElementById('opening-page');
    this.gamePageElement = document.getElementById('game-page');
    this.gameOverPageElement = document.getElementById('game-over-page');

    //create players
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

    //start a new game environment
    this.startFreshGame();
  }

  /////////////////////////////////////////////////////////////////////////////////
  //PAGE AND EVENTLISTENER SETUP METHODS
  /////////////////////////////////////////////////////////////////////////////////

  //PAGE SETUP METHODS=============================================================
  //Summary: setup the game page header and add to DOM
  setupGameHeader(playerName1, playerName2) {
    const gameHeaderElement = document.createElement('div');
    gameHeaderElement.id = 'game-header';
    this.gameHeaderElement = gameHeaderElement;
    this.gamePageElement.appendChild(gameHeaderElement);
    this.setupScoreBoard(playerName1, playerName2);
    this.setupProjectileBox();
  }

  //Summary: set up scoreboard with player name and score then add to DOM
  setupScoreBoard(playerName1, playerName2) {
    const scoreBoardElement = document.createElement('div');
    scoreBoardElement.classList.add('score-board');
    scoreBoardElement.innerHTML = `<div class="score-box"><p class="label">Player 1</p>
    <p class="player-name">${playerName1}</p></div>
    <p id="player-score">0</p><div class="score-box"><p class="label">Player 2</p>
    <p class="player-name">${playerName2}</p></div>`;
    this.gameHeaderElement.append(scoreBoardElement);
  }

  //Summary: set up projectile box that shows how many projectile a player has left then add
  //the element to DOM
  setupProjectileBox() {
    //create an element that will hold two projectile box elements
    const projRowElement = document.createElement('div');
    projRowElement.id = 'proj-row';

    //dynamically generate projectile box id based on bike Id
    const projId1 = this.BIKE1_ID + '-proj-box';
    const projId2 = this.BIKE2_ID + '-proj-box';
    //add to two projectile box elements to the projectile row elmeent
    projRowElement.innerHTML = `<div id=${projId1} class="proj-box"></div>
    <div id=${projId2} class="proj-box"></div>`;
    this.projRowElement = projRowElement;
    //for each projectile box, add NUM_PROJ number of projectile img as icon
    [...projRowElement.children].forEach((pbox) => {
      for (let i = 0; i < this.NUM_PROJ; i++) {
        const projIconElement = document.createElement('div');
        projIconElement.classList.add('proj-icon');
        projIconElement.innerHTML = `<img src=${this.PROJ_IMG_PATH} class="proj-icon-img"/>`;
        pbox.append(projIconElement);
      }
    });
    //add the projectile row element to game header
    this.gameHeaderElement.append(projRowElement);
  }

  //Summary: setup game arena and add to DOM
  setupArena() {
    //create an arena element and add to DOM
    const rootElement = document.getElementById('game-page');
    this.arenaElement = document.createElement('div');
    this.arenaElement.id = 'arena';
    this.arenaElement.style.width = this.ARENA_WIDTH + 'px';
    this.arenaElement.style.height = this.ARENA_HEIGHT + 'px';
    //this line together,with css, draws the gridlines for the arena
    this.arenaElement.style.backgroundSize = `${
      this.ARENA_WIDTH / this.ARENA_GRID_X_NUM
    }px ${this.ARENA_HEIGHT / this.ARENA_GRID_Y_NUM}px`;
    rootElement.appendChild(this.arenaElement);

    //add arena boundaries as Obstacle objects using relative position of the arena
    this.obstacles.push(
      new Obstacle([0, this.ARENA_HEIGHT, 0, 0], ObstacleType.wall)
    );
    this.obstacles.push(
      new Obstacle([0, 0, this.ARENA_WIDTH, 0], ObstacleType.wall)
    );
    this.obstacles.push(
      new Obstacle(
        [this.ARENA_WIDTH, 0, this.ARENA_WIDTH, this.ARENA_HEIGHT],
        ObstacleType.wall
      )
    );
    this.obstacles.push(
      new Obstacle(
        [0, this.ARENA_HEIGHT, this.ARENA_WIDTH, this.ARENA_HEIGHT],
        ObstacleType.wall
      )
    );
  }

  //Summary: create a canvas element for drawing ray trails and add it to DOM
  setupCanvas() {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = this.ARENA_WIDTH;
    canvasElement.height = this.ARENA_HEIGHT;
    document.getElementById('arena').appendChild(canvasElement);
    this.trailCanvasElement = canvasElement;
  }

  //Summary:hide gameplay screen and construct game over screen
  renderGameOverPage() {
    //switch screen
    this.gamePageElement.setAttribute('hidden', 'true');
    this.gameOverPageElement.removeAttribute('hidden');

    //calculate and display stats for each player
    document.getElementById(
      'winner-name'
    ).innerHTML = `${this.winningPlayer.name}`;
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
  }

  //EVENT LISTNERS=================================================================
  //Summary: wire up event listeners for Bike objects
  setupBikeEventListeners() {
    window.addEventListener('keydown', this.updateBikeEvent);
  }

  //Summary: remove event listeners for Bike objects
  removeBikeEventListeners() {
    window.removeEventListener('keydown', this.updateBikeEvent);
  }

  //Summary: key press event callback function for Bike objects
  updateBikeEvent = (event) => {
    this.players.forEach((player) => player.bike.updateBikeEvent(event.key));
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

  /////////////////////////////////////////////////////////////////////////////////
  //GAME LOGIC METHODS
  /////////////////////////////////////////////////////////////////////////////////

  //GAME INITIATION METHODS========================================================
  //Summary: setup or reset a new game environment then start the game loop.
  startFreshGame() {
    //reset parameters and elements
    this.gamePageElement.innerHTML = '';
    this.score = 0;
    this.obstacles = [];
    this.projectiles = [];
    this.lastTimestamp = undefined;
    this.winningPlayer = undefined;

    //delete the bikes if they already exist
    const bike1Element = document.getElementById(this.BIKE1_ID);
    if (bike1Element) {
      bike1Element.remove();
    }
    const bike2Element = document.getElementById(this.BIKE2_ID);
    if (bike2Element) {
      bike2Element.remove();
    }

    //set up game page components
    this.setupGameHeader(this.playerName1, this.playerName2);
    this.setupArena();
    this.setupCanvas();

    //create bikes and append to players
    const bike1 = new Bike(
      this.BIKE1_ID,
      this.BIKE1_ID,
      this.INITIAL_BIKE1_IMG_POS,
      this.INITIAL_BIKE1_DIR,
      this.BIKESPEED,
      this.BIKE1_CONTROL,
      this.BIKE1_IMG,
      this.BIKE1_TRAIL_COLOR,
      this.RAY_LIFETIME,
      this.NUM_PROJ,
      this.emitProjectile
    );
    this.players[0].bike = bike1;

    const bike2 = new Bike(
      this.BIKE2_ID,
      this.BIKE2_ID,
      this.INITIAL_BIKE2_IMG_POS,
      this.INITIAL_BIKE2_DIR,
      this.BIKESPEED,
      this.BIKE2_CONTROL,
      this.BIKE2_IMG,
      this.BIKE2_TRAIL_COLOR,
      this.RAY_LIFETIME,
      this.NUM_PROJ,
      this.emitProjectile
    );
    this.players[1].bike = bike2;

    //Depending on difficulty, add obstacles to the arena
    if (this.difficulty === 'medium') {
      this.addObstacles(this.MED_LEVEL_OBS_NUM);
    } else if (this.difficulty === 'hard') {
      this.addObstacles(this.HARD_LEVEL_OBS_NUM);
    }

    //start countdown and game loop
    this.gameStartCountDown();
  }
  //Summary: Add rock-type Obstacle instances with random positions to the game.
  //Input: integer indicating how many obstacles wanted.
  addObstacles(numObstacles) {
    //list of current arena objects, e.g. bike, rock
    let arenaObjects = [...this.players.map((p) => p.bike.element)];

    //generate random rock obstacle height
    for (let i = 0; i < numObstacles; i++) {
      const obsHeight =
        this.MIN_OBS_HEIGHT +
        Math.random() * (this.MAX_OBS_HEIGHT - this.MIN_OBS_HEIGHT);

      //add rock obstacle onto arena with initial arena-relative position [0,0]
      const obsElement = document.createElement('img');
      obsElement.src = this.OBS_IMG_PATH;
      obsElement.classList.add('rock');
      obsElement.style.height = obsHeight + 'px';
      obsElement.style.top = '0px';
      obsElement.style.left = '0px';
      this.arenaElement.appendChild(obsElement);

      //when it's loaded into DOM, randomly places it on the arena
      obsElement.onload = () => {
        //get the correspondible random rock width
        const obsWidth = obsElement.getBoundingClientRect().width;

        //max attempt 20 before moving on
        let attempts = 20;
        while (attempts) {
          let overlap = false;
          attempts -= 1;

          //randomly place the rock using arena relative position
          const left = Math.random() * (this.ARENA_WIDTH - obsWidth);
          const top = Math.random() * (this.ARENA_HEIGHT - obsHeight);
          obsElement.style.top = top + 'px';
          obsElement.style.left = left + 'px';
          const obsRect = obsElement.getBoundingClientRect();

          //check for overlap with existing arena objects, if so replace it to another
          //random location
          for (const obj of arenaObjects) {
            const objRect = obj.getBoundingClientRect();
            overlap = this.checkImageOverlap(obsRect, objRect);
            if (overlap) {
              break;
            }
          }
          //if no overlap found, leave rock image where it's
          if (!overlap) {
            const width = obsRect.width;
            const height = obsRect.height;
            //added rock elmenet to list of existing arena object
            arenaObjects.push(obsElement);
            //add rock's boundaries as rock-type Obstacle instances into the obstacle array tracked
            //in the game
            const obsId = Math.random();
            this.obstacles.push(
              new Obstacle(
                [left, top, left + width, top],
                ObstacleType.rock,
                obsId,
                null,
                obsElement
              ),
              new Obstacle(
                [left + width, top, left + width, top + height],
                ObstacleType.rock,
                obsId,
                null,
                obsElement
              ),
              new Obstacle(
                [left, top + height, left + width, top + height],
                ObstacleType.rock,
                obsId,
                null,
                obsElement
              ),
              new Obstacle(
                [left, top, left, top + height],
                ObstacleType.rock,
                obsId,
                null,
                obsElement
              )
            );
            break;
          } else {
            //delete this rock elmenet from DOM even it can't be placed within allowed attempts
            obsElement.remove();
          }
        }
      };
    }
  }

  //Summary: check if two rectangular html image elements have overlap
  //overlap is true when a corner of an image 1 is within both the x-range
  //and y-range of image 2.
  //Input: inputs are DOMRect objects that are returned from calling getBoundingClientRect()
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

  //Summary: count down to game start then invoke the core game loop.
  gameStartCountDown() {
    let counter = 3;
    //create count down text and add to DOM
    const countDownTextElement = document.createElement('div');
    countDownTextElement.classList.add('pop-up-text');
    countDownTextElement.innerHTML = counter;
    this.arenaElement.append(countDownTextElement);
    //using setInterval to update countdown text
    const timeoutId = setInterval(() => {
      if (counter) {
        counter--;
        const text = counter ? counter : 'GO';
        countDownTextElement.innerHTML = text;
      } else {
        clearInterval(timeoutId);
        countDownTextElement.remove();

        //initialize game start parameters and start the core game loop
        this.isRunning = true;
        this.gameStartTime = Date.now();
        this.setupBikeEventListeners();
        this.animFrameId = requestAnimationFrame(this.evolveGame);
      }
    }, 1000);
  }

  //CORE GAME LOOP METHODS=========================================================
  //Summary: core game loop logic that evolves everything in the game page, check for collisions,
  //and listens to key press events
  evolveGame = (timestamp) => {
    //initialize lastTimestamp during the the first loop
    if (this.lastTimestamp === undefined) {
      this.lastTimestamp = timestamp;
    }

    //if enough time has passed, evolve the game by one loop else wait until next computer screen refresh
    if (timestamp - this.lastTimestamp >= this.GAME_REFRESH_RATE) {
      this.lastTimestamp = timestamp;

      //advance bike motion and update its trail on canvas
      this.players.forEach((player, i) => {
        const bike = player.bike;
        bike.moveForwardAndAddTrail();
        const obsToRemove = bike.findExpiredTrail();
        this.eraseCanvasTrail(obsToRemove);
        this.drawCanvasTrail();
      });

      //build a list of current obstacles that exist in the arena. We do this because
      //the content of each bike trail array and projectile array can get updated during
      //each game loop
      let updatedObstacles = [...this.obstacles];
      this.players.forEach((player) => {
        updatedObstacles = [
          ...updatedObstacles,
          ...player.bike.boundaries,
          ...player.bike.getTrailForCollisionCheck()
        ];
      });

      //add projectile boundaries to udpatedObstacles as well
      this.projectiles.forEach((p) => {
        updatedObstacles.push(...p.boundaries);
      });

      //advance projectile motion
      this.projectiles.forEach((proj) => {
        proj.moveForward(proj);
      });

      //increment score
      this.incrementScore();

      //check for collision with bikes
      this.checkBikeCollision(updatedObstacles);

      //check for collision with laser
      this.checkProjectileCollision(updatedObstacles);
    }
    //check if we should run the game loop again
    if (this.isRunning) {
      this.animFrameId = requestAnimationFrame(this.evolveGame);
    } else {
      cancelAnimationFrame(this.animFrameId);
      this.endGame();
    }
  };

  //Summary: Pause the collision scene with Game over text for some time, remove game-related
  //event listeners then render game over page
  endGame() {
    //display Game Over text for 2 seconds
    const endGameTextElement = document.createElement('div');
    endGameTextElement.classList.add('pop-up-text');
    endGameTextElement.innerHTML = 'Game Over';
    this.arenaElement.append(endGameTextElement);
    const timeoutId = setTimeout(() => {
      endGameTextElement.remove();
      //remove event listeners, update score and render game-over page
      this.removeBikeEventListeners();
      this.winningPlayer.updateScore(this.score);
      this.renderGameOverPage();
    }, 2000);
  }

  //GAME RELATED METHODS=========================================================

  //Summary: increase score in the scoreBoardElement. The score is the number of
  //100 miliseconds since game started
  incrementScore() {
    const newScore = Math.round((Date.now() - this.gameStartTime) / 100);
    this.score = newScore;
    const scoreElement = document.getElementById('player-score');
    scoreElement.textContent = `${newScore}`;
  }

  //Summary: callback function for bike when the emit projectile key is pressed
  //Input: a Bike instance
  emitProjectile = (bike) => {
    //add projectile to list for collision checking
    const projId = Math.random();
    this.projectiles.push(
      new Projectile(
        projId,
        bike.id,
        bike.centerPosition,
        bike.direction,
        this.PROJ_SPEED,
        this.PROJ_IMG_PATH
      )
    );
    //remove a projectile icon from projectile box element
    const iconId = bike.id + '-proj-box';
    const projBox = document.getElementById(iconId);
    projBox.removeChild(projBox.children[0]);
  };

  //Summary: check collision between each bike's boundary and all obstacles in the arena
  //Input: an array of Obstacle instances
  checkBikeCollision(updatedObstacles) {
    for (const player of this.players) {
      for (const obs of updatedObstacles) {
        //check collision between bike and every Obstacle instance
        if (player.bike.hasCollided(obs)) {
          //if bike collided with its own boundary or laser, ignore it and move on
          switch (true) {
            case player.bike.id == obs.ownerId && obs.type == ObstacleType.bike:
            case player.bike.id == obs.ownerId &&
              obs.type == ObstacleType.projectile:
              break;
            //if bike collided with other things, declare the other bike's player as winner
            default:
              //figure out the winning player and end the game
              this.winningPlayer = this.players.filter((p) => p != player)[0];
              this.isRunning = false;
              return;
          }
        }
      }
    }
  }

  //Summary: check collision between each bike's boundary and all obstacles in the arena
  //Input: an array of Obstacle instances
  checkProjectileCollision(updatedObstacles) {
    for (const obs of updatedObstacles) {
      let i = this.projectiles.length;
      //looping from the end of array is necessary because the projectile that has collided
      //will be removed in place when we handle the collision and forward loop will skip over
      //projectile unexpectedly. The first existential condition check is also needed because
      //two projectiles might be removed at once if they collide with each other
      while (i--) {
        if (this.projectiles[i] && this.projectiles[i].hasCollided(obs)) {
          this.handleProjectileCollision(obs, i);
        }
      }
    }
  }

  //Summary: handle projectile collision based on what it collided with
  //Input: obstacle is an Obstacle instance
  //pIndex is the index of the collided projectile in the projectiles array properties of Game
  handleProjectileCollision(obstacle, pIndex) {
    const projectile = this.projectiles[pIndex];
    switch (obstacle.type) {
      //if wall, only remove projectile itself
      case ObstacleType.wall:
        //remove projectile object and its html element
        projectile.element.remove();
        this.projectiles.splice(pIndex, 1);
        break;
      //If rock, remove rock and projectile
      case ObstacleType.rock:
        //remove projectile object and its html element
        projectile.element.remove();
        this.projectiles.splice(pIndex, 1);
        //remove html element and the 4 Obstacle isntance that represent the rock
        obstacle.element.remove();
        this.obstacles = this.obstacles.filter(
          (obs) => obs.ownerId != obstacle.ownerId
        );
        break;
      //If trail, remove trail segments from contact point and remove projectile
      case ObstacleType.trail:
        //remove projectile object and its html element
        projectile.element.remove();
        this.projectiles.splice(pIndex, 1);
        //remove all trailing trail from point of contact
        this.removeTrailFrom(obstacle);
        break;
      //If bike, end game if projectile from player A hits player B else ignore
      case ObstacleType.bike:
        const projectileGroupId = projectile.groupId;
        if (obstacle.ownerId != projectileGroupId) {
          //game ended, find out the winner and signal game has ended
          this.winningPlayer = this.players.filter(
            (player) => player.bike.id == projectileGroupId
          )[0];
          this.isRunning = false;
          //remove projectile object and its html element
          projectile.element.remove();
          this.projectiles.splice(pIndex, 1);
        }
        break;
      //if another projecticle, delete them both from screen
      case ObstacleType.projectile:
        //find the other projectile in projectile array and its index in array
        const otherProjectile = this.projectiles.filter(
          (p) => p.groupId === obstacle.ownerId
        )[0];
        const otherProjectileIndex = this.projectiles.indexOf(otherProjectile);
        //if the collision between two projectile boundary obstacles are not from
        //the same projectile, then emove both projectiles from array and from screne
        if (projectile.id != otherProjectile.id) {
          //remove both projectile object and their html element
          projectile.element.remove();
          this.projectiles.splice(pIndex, 1);
          otherProjectile.element.remove();
          this.projectiles.splice(otherProjectileIndex, 1);
        }
    }
  }

  //Summary: draw ray trails for all bike's in the game. When it's called in every game loop
  //instead of adding to the end, it always redraw the entire trail from beginning to achieve
  //the neon blur effect
  drawCanvasTrail() {
    const ctx = this.trailCanvasElement.getContext('2d');
    //draw the trail of each bike
    this.players.forEach((player) => {
      const trailSegments = player.bike.trail;
      //set styles of trail
      ctx.strokeStyle = player.bike.trailColor;
      ctx.lineWidth = this.RAYWIDTH;
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowBlur = this.RAYWIDTH;
      ctx.shadowColor = player.bike.trailColor;
      //define trail
      ctx.beginPath();
      trailSegments.forEach((seg) => {
        const pos = seg.position;
        ctx.moveTo(pos[0], pos[1]);
        ctx.lineTo(pos[2], pos[3]);
      });
      //draw trail
      ctx.stroke();
    });
  }

  //Summary: erase unwanted trails using the position of each trail. Rectangular regions covering
  //each unwanted trail segment are erased. The width and height of the region is tuned to also
  //cover the blur portion of the ray.
  //Input: an array of trail-type Obstacle instances
  eraseCanvasTrail(segsToRemove) {
    const ctx = this.trailCanvasElement.getContext('2d');
    for (const seg of segsToRemove) {
      //pos is an array [x1, y1, x2, y2]
      const pos = seg.position;
      //find top left value of the segment
      const left = Math.min(pos[0], pos[2]) - 2 * this.RAYWIDTH;
      const top = Math.min(pos[1], pos[3]) - 2 * this.RAYWIDTH;
      //find the horizontal and vertical distance to erase from the top left values
      const width = Math.abs(pos[2] - pos[0]) + 4 * this.RAYWIDTH;
      const height = Math.abs(pos[3] - pos[1]) + 4 * this.RAYWIDTH;
      ctx.clearRect(left, top, width, height);
    }
  }

  //Summary: remove all trails segments from the spcified segment to the end farthest away
  //from its bike in terms of connectedness.
  //Input: a trail-type Obstacle instance
  removeTrailFrom(seg) {
    //get the bike that owns this trail segment
    const bikeId = seg.ownerId;
    const bike = this.players.filter((player) => {
      return player.bike.id == bikeId;
    })[0].bike;
    //find index of the segment in the bike's trail array
    const index = bike.trail.findIndex((trailSeg) => {
      return trailSeg.position == seg.position;
    });

    //extend the trail deletion further to allow all bikes on the arena to pass through
    //without touching the trail
    const halfWidthOfWidestBike =
      Math.max(
        ...this.players.map((player) => {
          return Math.min(player.bike.objWidth, player.bike.objHeight);
        })
      ) / 2;

    //calculate the new index to delete trail from
    const deletionIndex =
      //plus two below because one account the seg that crossed with projectile and one to handle
      //edge case when bike touches one end of the ray as it passes by
      Math.ceil(index + halfWidthOfWidestBike / this.BIKESPEED) + 2;

    //erase deleted trail from canvas and update trail array of the bike
    this.eraseCanvasTrail(bike.trail.slice(0, deletionIndex));
    bike.trail = bike.trail.slice(deletionIndex);
  }
}
