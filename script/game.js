import Bike from './bike.js';
import Direction from './direction_enum.js';

const SEGLENGTH = 1; //intrinsic segment length of the game
const RAYWIDTH = 3;
const BIKESPEED = 5;

let ARENA_WIDTH;
let ARENA_HEIGHT;
let ARENA_CEN_POS;

let obstacles = [];
let walls = [];
let bikes = []; //list of bike objects
let trailCanvases = []; //canvas html elements

const createBikes = () => {
  const bike1 = new Bike(
    [ARENA_CEN_POS[0] + 200, ARENA_CEN_POS[1]],
    Direction.left,
    BIKESPEED,
    'Alex',
    '../img/green-bike.jpg',
    'rgb(57, 255, 20)',

    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
  );
  bikes.push(bike1);

  const bike2 = new Bike(
    [ARENA_CEN_POS[0] - 200, ARENA_CEN_POS[1]],
    Direction.right,
    BIKESPEED,
    'Josh',
    '../img/shopping-cart.jpg',
    'rgb(188, 19, 254)',
    ['w', 's', 'a', 'd']
  );
  bikes.push(bike2);
};

const setupArena = () => {
  const as = document.getElementById('arena').getBoundingClientRect();
  ARENA_WIDTH = as.width.toFixed(4);
  ARENA_HEIGHT = as.height.toFixed(4);
  ARENA_CEN_POS = [ARENA_WIDTH / 2.0, ARENA_HEIGHT / 2.0];
  //add arena boundaries as obstacles using relative position of the area
  walls.push([0, ARENA_HEIGHT, 0, 0]);
  walls.push([0, 0, ARENA_WIDTH, 0]);
  walls.push([ARENA_WIDTH, 0, ARENA_WIDTH, ARENA_HEIGHT]);
  walls.push([0, ARENA_HEIGHT, ARENA_WIDTH, ARENA_HEIGHT]);
};

const setupCanvases = () => {
  bikes.forEach((i) => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = ARENA_WIDTH;
    canvasElement.height = ARENA_HEIGHT;
    document.getElementById('arena').appendChild(canvasElement);
    trailCanvases.push(canvasElement);
  });
};

const evolveGame = () => {
  const gameInterval = setInterval(() => {
    bikes.forEach((bike, i) => {
      bike.moveForward();
      drawTrail(i);
    });

    //construct a list of all obstacles in the game
    obstacles = [...walls];
    bikes.forEach((bike) => {
      obstacles = [...obstacles, ...bike.getTrail()];
    });
    //check for collision
    for (const obstacle of obstacles) {
      const hasCollided = bikes.map((bike) => bike.hasCollided(obstacle));
      if (hasCollided.includes(true)) {
        console.log('game over');
        clearInterval(gameInterval);
        window.removeEventListener('keydown', updateBikeDirection);
      }
    }
  }, 30);
};

const setupEventListeners = () => {
  window.addEventListener('keydown', updateBikeDirection);
};

const updateBikeDirection = (event) => {
  bikes.forEach((bike) => bike.updateDirection(event.key));
};

const drawTrail = (i) => {
  const trailSegments = bikes[i].getTrail();
  const canvas = trailCanvases[i];
  const ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowBlur = RAYWIDTH;
  ctx.shadowColor = bikes[i].getTrailColor();
  ctx.beginPath();
  trailSegments.forEach((seg) => {
    ctx.moveTo(seg[0], seg[1]);
    ctx.lineTo(seg[2], seg[3]);
  });
  ctx.strokeStyle = bikes[i].getTrailColor();
  ctx.lineWidth = RAYWIDTH;
  ctx.stroke();
};

//Entry point for the game
window.addEventListener('DOMContentLoaded', () => {
  setupArena();
  createBikes();
  setupCanvases();
  setupEventListeners();
  evolveGame();
});
