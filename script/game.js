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
    '../img/green-bike.jpg'
  );

  //BEGINNING#####################################################
  const dotElement = document.createElement('img');
  const bikeElement = document.getElementById('Alex');
  dotElement.id = 'circle';
  dotElement.style.top = bike1.getHeadPosition()[1];
  dotElement.style.left = bike1.getHeadPosition()[0];
  const arena = document.getElementById('arena');
  arena.appendChild(dotElement);
  //END####################################################

  //advance bike motion
  const gameInterval = setInterval(() => {
    bike1.moveForward();
    //BEGINNING#######################################
    dotElement.style.top = bike1.getHeadPosition()[1] + 'px';
    dotElement.style.left = bike1.getHeadPosition()[0] + 'px';

    //END######################################

    for (const obstacle of obstacles) {
      const hasCollided = bike1.hasCollided(obstacle);
      if (hasCollided) {
        console.log(bike1.position);
        console.log('game over');
        clearInterval(gameInterval);
        window.removeEventListener('keydown', (event) => {
          bike1.updateDirection(event.key);
        });
      }
    }
  }, 30);

  //add keydown event listener to bike
  window.addEventListener('keydown', (event) => {
    bike1.updateDirection(event.key);
  });
});
