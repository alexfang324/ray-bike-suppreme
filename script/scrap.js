//Summary: define walls that represent the boundary of the game play area
//Input: l is number of segLength the zone spans horizontally
//       w is number of segLength the zone spans vertically
//Output: an array of wall segments each represented by an array of [x1, y1, x2, y2]
const createWalls = (l, w) => {
  let walls = [];
  let x = 0;
  let y = 0;
  //construct bottom horizontal wall
  for (let i = 0; i < l; i++) {
    const x2 = x + segLength;
    walls.push([x, y, x2, y]);
    x = x2;
  }
  //construct right vertical wall
  for (let i = 0; i < w; i++) {
    const y2 = y + segLength;
    walls.push([x, y, x, y2]);
    y = y2;
  }
  //construct top horizontal wall
  for (let i = l - 1; i > -1; i--) {
    const x1 = x - segLength;
    walls.push([x1, y, x, y]);
    x = x1;
  }
  //construct left vertical wall
  for (let i = w - 1; i > -1; i--) {
    const y1 = y - segLength;
    walls.push([x, y1, x, y]);
    y = y1;
  }

  return walls;
};

const renderWalls = (walls) => {
  const targetElement = document.getElementById('root');
  const wallElements = document.createElement('div');
  wallElements.className = 'game-boundary';
  walls.forEach((wall) => {
    const wallElement = document.createElement('img');
    wallElement.src = './img/wall.jpg';
    wallElement.style =
      'position: absolute;left:' +
      wall[0] * 160 +
      'px;top:' +
      wall[1] * 160 +
      'px;width:160px;';
    wallElements.appendChild(wallElement);
  });
  console.log(wallElements);
  targetElement.replaceWith(wallElements);
};

// script for creaing dot
//BEGINNING#####################################################
const dotElement = document.createElement('img');
const bikeElement = document.getElementById('Alex');
dotElement.id = 'circle';
dotElement.style.top = bike1.getHeadPosition()[1] + 'px';
dotElement.style.left = bike1.getHeadPosition()[0] + 'px';
const arena = document.getElementById('arena');
arena.appendChild(dotElement);
//END###########################################################

import Direction from './direction_enum.js';

export default class Bike {
  #arena;
  #bikeElement; //img html element of the bike
  #imgPosition; //top left position of img when it's first loaded
  #imgWidth; //img width when it's first loaded
  #imgHeight; //img height when it's first loaded
  #kbControl; //an array [up,down,left,right] keyboard control key of bike
  #headPosition; //[x,y] position of bike's head
  #centerPosition; //[x,y] position of bike's center
  #tailPosition; //[x,y] position of bike's tail
  #direction; //current direction of bike's motion
  #speed; //num pixel bike moves per game interation
  #bikeId; //id field of bike's img html element
  #centerSeg; //[x_old, y_old, x_new, y_new],evolution of bike center position during last interation
  #trail; // a list of [x1,y1,x2,y2] segments the bike has travelled over
  #trailColor; //color of the trail

  BikeRotation = Object.freeze({
    up: '0deg',
    right: '90deg',
    down: '180deg',
    left: '270deg'
  });

  constructor(
    imgPosition,
    direction,
    speed,
    bikeId,
    imgSrc,
    trailColor,
    kbControl
  ) {
    this.imgPosition = imgPosition;
    this.direction = direction;
    this.kbControl = kbControl;
    this.speed = speed;
    this.bikeId = bikeId;
    this.centerPosition = this.calculateCenterPosition();
    this.headPosition = this.calculateHeadPosition();
    this.tailPosition = this.calculateTailPosition();
    this.centerSeg = [...this.centerPosition, ...this.centerPosition];
    this.trail = [];
    this.arena = document.getElementById('arena');
    const bike = document.createElement('img');
    bike.id = bikeId;
    bike.src = imgSrc;
    bike.style.top = imgPosition[1] + 'px';
    bike.style.left = imgPosition[0] + 'px';
    bike.classList.add('bike');
    this.arena.appendChild(bike);
    this.bikeElement = bike;
    this.trailColor = trailColor;

    //img dimension properties are only available once img has loaded. we want the initial
    //dimension for future headPosition calculation so rotate only after recording the dimensions
    bike.onload = () => {
      this.imgWidth = parseFloat(bike.getBoundingClientRect().width.toFixed(4));
      this.imgHeight = parseFloat(
        bike.getBoundingClientRect().height.toFixed(4)
      );
      bike.style.rotate = this.BikeRotation[direction];
    };

    return this;
  }

  //Summary: Return trail of the bike
  //Output: list of segments where each segement is an array [x1,y1,x2,y2]
  getTrail = () => {
    return this.trail;
  };

  //Summary: Return color of trail
  //Output: trail color in word or hexadecimal
  getTrailColor = () => {
    return this.trailColor;
  };

  //Summary: return head position of the bike image
  //Output: array of bike head position [x1, y1]
  getHeadPosition = () => {
    return this.headPosition;
  };

  //Summary: return tail position of the bike image
  //Output: array of bike tail position [x1, y1]
  getTailPosition = () => {
    return this.tailPosition;
  };

  //Summary: Calculate position of bike's head, given it's direction, using image position
  //         (top left of initial img) and initial img width and height.
  //Output: array of x, y of bike's head position.

  calculateCenterPosition = () => {
    switch (this.direction) {
      case Direction.up || Direction.down:
        return [
          this.imgPosition[0] + this.imgWidth / 2.0,
          this.imgPosition[1] + this.imgHeight / 2.0
        ];
      case Direction.left || Direction.right:
        return [
          this.imgPosition[0] + this.imgHeight / 2.0,
          this.imgPosition[1] + this.imgWidth / 2.0
        ];
    }
  };

  calculateHeadPosition = () => {
    switch (this.direction) {
      case Direction.up:
        return [
          this.centerPosition[0],
          this.centerPosition[1] - this.imgHeight / 2.0
        ];
      case Direction.down:
        return [
          this.centerPosition[0],
          this.centerPosition[1] + this.imgHeight / 2.0
        ];
      case Direction.left:
        return [
          this.centerPosition[0] - this.imgHeight / 2.0,
          this.centerPosition[1]
        ];
      case Direction.right:
        console.log(this.centerPosition);
        return [
          this.centerPosition[0] + this.imgHeight / 2.0,
          this.centerPosition[1]
        ];
    }
  };

  calculateTailPosition = () => {
    switch (this.direction) {
      case Direction.up:
        return [
          this.centerPosition[0],
          this.centerPosition[1] + this.imgHeight / 2.0
        ];
      case Direction.down:
        return [
          this.centerPosition[0],
          this.centerPosition[1] - this.imgHeight / 2.0
        ];
      case Direction.left:
        return [
          this.centerPosition[0] + this.imgHeight / 2.0,
          this.centerPosition[1]
        ];
      case Direction.right:
        return [
          this.centerPosition[0] - this.imgHeight / 2.0,
          this.centerPosition[1]
        ];
    }
  };

  //Summary: Advance bike imgPosition based on bike speed and direction
  //Output: Bike's new imgPosition
  moveForward = () => {
    const bike = document.getElementById(this.bikeId);
    const oldCenterPostion = [...this.centerPosition]; //copy by value
    switch (this.direction) {
      case Direction.up:
        this.imgPosition[1] -= this.speed;
        bike.style.top = this.imgPosition[1] + 'px';
        break;
      case Direction.down:
        this.imgPosition[1] += this.speed;
        bike.style.top = this.imgPosition[1] + 'px';
        break;
      case Direction.left:
        this.imgPosition[0] -= this.speed;
        bike.style.left = this.imgPosition[0] + 'px';
        break;
      case Direction.right:
        this.imgPosition[0] += this.speed;
        bike.style.left = this.imgPosition[0] + 'px';
        break;
    }
    this.centerPosition = this.calculateCenterPosition();
    this.centerSeg = [...oldCenterPostion, ...this.centerPosition];
    this.trail.push(this.centerSeg);
  };

  //Summary: Return imgPosition of the bike image
  //Output: An array [left, top] of img position in pixel
  getImgPosition = () => {
    return this.imgPosition;
  };

  //Summary: update bike's moving direction
  //Input: a valid direction from the Direction enum
  //Output: Null
  updateDirection = (key) => {
    switch (key) {
      case this.kbControl[0]:
        this.direction = Direction.up;
        break;
      case this.kbControl[1]:
        this.direction = Direction.down;
        break;
      case this.kbControl[2]:
        this.direction = Direction.left;
        break;
      case this.kbControl[3]:
        this.direction = Direction.right;
    }
    const bike = document.getElementById(this.bikeId);
    bike.style.rotate = this.BikeRotation[this.direction];
  };

  //Summary: Check if a bike's last movement collided with another game object (i.e. obstacles).
  //Input: centerSeg is an array [x_old, y_old, x_new, y_new], reprsenting bike center's last movement
  //       obstacle is either a segment [x1,y1,x2,y2], e.g. wall or ray segment, or a position (x1,y1), e.g. point-like obstacle.
  //Output: boolean of whether a collision happend
  //Assumption: assumed every obstacle segment is a horizontal or vertical line.
  hasCollided = (obstacle) => {
    let collided = false;
    if (obstacle.length == 4) {
      const bikeSeg = [
        ...this.calculateTailPosition(),
        ...this.calculateHeadPosition()
      ];

      const bikeDir = bikeSeg[2] - bikeSeg[0] == 0 ? 'vertical' : 'horizontal';
      const objDir = obstacle[2] - obstacle[0] == 0 ? 'vertical' : 'horizontal';

      if (bikeDir == 'horizontal' && objDir == 'vertical') {
        const minObjY = Math.min(obstacle[1], obstacle[3]);
        const maxObjY = Math.max(obstacle[1], obstacle[3]);
        const minBikeX = Math.min(bikeSeg[0], bikeSeg[2]);
        const maxBikeX = Math.max(bikeSeg[0], bikeSeg[2]);
        if (
          bikeSeg[1] >= minObjY &&
          bikeSeg[1] <= maxObjY &&
          minBikeX <= obstacle[0] &&
          maxBikeX >= obstacle[0]
        ) {
          collided = true;
        }
      }

      if (bikeDir == 'vertical' && objDir == 'horizontal') {
        const minObjX = Math.min(obstacle[0], obstacle[2]);
        const maxObjX = Math.max(obstacle[0], obstacle[2]);
        const minBikeY = Math.min(bikeSeg[1], bikeSeg[3]);
        const maxBikeY = Math.max(bikeSeg[1], bikeSeg[3]);
        if (
          bikeSeg[0] >= minObjX &&
          bikeSeg[0] <= maxObjX &&
          minBikeY <= obstacle[1] &&
          maxBikeY >= obstacle[1]
        ) {
          collided = true;
        }
      }
    } else {
      //obstacle is a single point on grid
      const sameX =
        obstacle[0] == bikeSeg[0] || obstacle[0] == bikeSeg[2] ? true : false;
      const sameY =
        obstacle[1] == bikeSeg[1] || obstacle[1] == bikeSeg[3] ? true : false;
      collided = sameX && sameY ? true : false;
    }
    return collided;
  };
}
