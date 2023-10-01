import Bike from './bike.js';
import Direction from './direction_enum.js';

const SEGLENGTH = 1; //intrinsic segment length of the game
let ARENA_WIDTH;
let ARENA_HEIGHT;
let ARENA_CEN_POS;
let obstacles = [];
let bikes = []; //list of bike objects
let trailCanvases = []; //canvas html elements

const updateBikeDirection = (event) => {
  bikes.forEach((bike) => bike.updateDirection(event.key));
};

const drawTrail = (i) => {
  const trailSegments = bikes[i].getTrail();
  const canvas = trailCanvases[i];
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  trailSegments.forEach((seg) => {
    ctx.moveTo(seg[0], seg[1]);
    ctx.lineTo(seg[2], seg[3]);
  });
  ctx.strokeStyle = bikes[i].getTrailColor();
  ctx.lineWidth = 5;
  ctx.stroke();
};

window.addEventListener('DOMContentLoaded', () => {
  //set up arena
  const as = document.getElementById('arena').getBoundingClientRect();
  const top = parseFloat(as.top.toFixed(4));
  const bottom = parseFloat(as.bottom.toFixed(4));
  const left = parseFloat(as.left.toFixed(4));
  const right = parseFloat(as.right.toFixed(4));

  ARENA_WIDTH = as.width.toFixed(4);
  ARENA_HEIGHT = as.height.toFixed(4);
  ARENA_CEN_POS = [(right + left) / 2.0, (top + bottom) / 2.0];
  //add arena boundaries as obstacles
  obstacles.push([left, bottom, left, top]);
  obstacles.push([left, top, right, top]);
  obstacles.push([right, top, right, bottom]);
  obstacles.push([left, bottom, right, bottom]);

  //create bikes
  const bike1 = new Bike(
    [ARENA_CEN_POS[0] + 200, ARENA_CEN_POS[1]],
    Direction.left,
    10,
    'Alex',
    '../img/green-bike.jpg',
    'green',

    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
  );
  bikes.push(bike1);

  const bike2 = new Bike(
    [ARENA_CEN_POS[0] - 200, ARENA_CEN_POS[1]],
    Direction.right,
    10,
    'Josh',
    '../img/shopping-cart.jpg',
    'red',
    ['w', 's', 'a', 'd']
  );
  bikes.push(bike2);

  //BEGINNING#####################################################
  const dotElement = document.createElement('img');
  dotElement.id = 'circle';
  dotElement.style.top = bikes[0].getHeadPosition()[1] + 'px';
  dotElement.style.left = bikes[0].getHeadPosition()[0] + 'px';
  const arena = document.getElementById('arena');
  arena.appendChild(dotElement);
  //END###########################################################

  //add canvases for drawing bike trails
  bikes.forEach((i) => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = ARENA_WIDTH;
    canvasElement.height = ARENA_HEIGHT;
    document.getElementById('arena').appendChild(canvasElement);
    trailCanvases.push(canvasElement);
  });

  //advance bike motion
  const gameInterval = setInterval(() => {
    bikes.forEach((bike, i) => {
      bike.moveForward();
      drawTrail(i);
    });

    //BEGINNING#####################################################
    dotElement.style.top = bikes[0].getTrail().slice(-1)[0][3] + 'px';
    dotElement.style.left = bikes[0].getTrail().slice(-1)[0][2] + 'px';
    //END###########################################################

    for (const obstacle of obstacles) {
      const hasCollided = bikes.map((bike) => bike.hasCollided(obstacle));
      if (hasCollided.includes(true)) {
        console.log('game over');
        clearInterval(gameInterval);
        window.removeEventListener('keydown', updateBikeDirection);
      }
    }
  }, 30);

  //add keydown event listener to bike
  window.addEventListener('keydown', updateBikeDirection);
});
