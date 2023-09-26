import Bike from './bike.js';
import Direction from './direction_enum.js';

const SEGLENGTH = 1; //intrinsic segment length of the game
let ARENA_WIDTH;
let ARENA_HEIGHT;
let ARENA_CEN_POS;
let obstacles = [];

window.addEventListener('DOMContentLoaded', () => {
  //set up arena
  const as = document.getElementById('arena').getBoundingClientRect();
  const top = parseFloat(as.top.toFixed(2));
  const bottom = parseFloat(as.bottom.toFixed(2));
  const left = parseFloat(as.left.toFixed(2));
  const right = parseFloat(as.right.toFixed(2));

  ARENA_WIDTH = as.width.toFixed(2);
  ARENA_HEIGHT = as.height.toFixed(2);
  ARENA_CEN_POS = [(right + left) / 2, (top + bottom) / 2];
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
    'Alex'
  );

  //advance bike motion
  const gameInterval = setInterval(() => {
    for (const obstacle of obstacles) {
      const hasCollided = bike1.hasCollided(obstacle);
      if (hasCollided) {
        console.log('game over');
        clearInterval(gameInterval);
      }
    }
    bike1.moveForward();
  }, 50);

  //add keydown event listener to bike
  window.addEventListener('keydown', (event) => {
    bike1.updateDirection(event.key);
  });
});
