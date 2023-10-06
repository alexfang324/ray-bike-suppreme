import Game from './game.js';
import Bike from './bike.js';
import Direction from './direction_enum.js';

export default class TwoPlayerGame extends Game {
  _difficulty; //game difficulty
  _numObstacles = 5; //number of obstacles in medium difficulty mode
  _minObsHeight = 20; //minimum obstacle height in px;
  _maxObsHeight = 100; //max obstacle height in px;
  _obsImgPath = '../img/rock.jpg';

  constructor(difficulty) {
    super();
    this._difficulty = difficulty;
    this.setupArena();
    this.createBikes();
    this.setupCanvases();
    if (difficulty === 'medium') {
      this.addObstacles();
    }
    this.setupEventListeners();
    this.evolveGame();
  }

  createBikes = () => {
    const bike1 = new Bike(
      [this._ARENA_CEN_POS[0] + 200, this._ARENA_CEN_POS[1]],
      Direction.left,
      this._BIKESPEED,
      'Alex',
      '../img/green-bike.jpg',
      'rgb(57, 255, 20)',
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    );
    this._bikes.push(bike1);

    const bike2 = new Bike(
      [this._ARENA_CEN_POS[0] - 200, this._ARENA_CEN_POS[1]],
      Direction.right,
      this._BIKESPEED,
      'Josh',
      '../img/shopping-cart.jpg',
      'rgb(188, 19, 254)',
      ['w', 's', 'a', 'd']
    );
    this._bikes.push(bike2);
  };

  addObstacles = () => {
    //list of arena objects, e.g. bike, rock
    let arenaObjects = [...this._bikes.map((b) => b.getElement())];

    //get variable obstacle height
    for (let i = 0; i < this._numObstacles; i++) {
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
            overlap = overlap || this.checkImageOverlap(obsRect, objRect);
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
}
