import Bike from './bike.js';
import Direction from './direction_enum.js';

const SEGLENGTH = 1; //intrinsic segment length of the game
let ARENA_WIDTH;
let ARENA_HEIGHT;
let ARENA_CEN_POS;
let obstacles = [];
let bikes = [];

const updateBikeDirection = (event) => {
  bikes.forEach((bike) => bike.updateDirection(event.key));
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

  //add canvas for drawing bike trails

  //create bikes
  const bike1 = new Bike(
    [ARENA_CEN_POS[0] + 200, ARENA_CEN_POS[1]],
    Direction.left,
    10,
    'Alex',
    '../img/green-bike.jpg',
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
  );
  bikes.push(bike1);

  const bike2 = new Bike(
    [ARENA_CEN_POS[0] - 200, ARENA_CEN_POS[1]],
    Direction.right,
    10,
    'Josh',
    '../img/shopping-cart.jpg',
    ['w', 's', 'a', 'd']
  );
  bikes.push(bike2);

  //advance bike motion
  const gameInterval = setInterval(() => {
    bikes.forEach((bike) => bike.moveForward());
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
