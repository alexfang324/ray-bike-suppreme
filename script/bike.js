'use strict';
import Direction from './direction_enum.js';

export default class Bike {
  _DIR_ARRAY = ['up', 'right', 'down', 'left']; //order of bike dir as user hits the right key
  _RAY_LIFETIME;
  _arena;
  _bikeElement; //img html element of the bike
  _imgPosition; //top left position of img when it's first loaded
  _imgWidth; //img width when it's first loaded
  _imgHeight; //img height when it's first loaded
  _kbControl; //an array [up,down,left,right] keyboard control key of bike
  _headPosition; //[x,y] position of bike's head
  _centerPosition; //[x,y] position of bike's center
  _tailPosition; //[x,y] position of bike's tail
  _direction; //current direction of bike's motion
  _speed; //num pixel bike moves per game interation
  _bikeId; //id field of bike's img html element
  _centerSeg; //[x_old, y_old, x_new, y_new],evolution of bike center position during last interation
  _trail; // a list of [x1,y1,x2,y2,ttl] segments the bike has travelled over and the segment time to live time
  _trailColor; //color of the trail
  _cttSegNum; //number of segments needed to span from bike center to bike tail

  //enum relating bike pointing direction and image rotation angled needed
  _BikeRotation = Object.freeze({
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
    kbControl,
    imgSrc,
    trailColor,
    rayLifetime
  ) {
    this._imgPosition = [...imgPosition];
    this._direction = direction;
    this._headPosition = this.calculateHeadPosition();
    this._centerPosition = this.calculateCenterPosition();
    this._tailPosition = this.calculateTailPosition();
    this._kbControl = kbControl;
    this._speed = speed;
    this._bikeId = bikeId;
    this._centerSeg = [...this._centerPosition, ...this._centerPosition];
    this._trail = [];
    this._arena = document.getElementById('arena');
    const bike = document.createElement('img');
    bike.id = bikeId;
    bike.src = imgSrc;
    bike.style.top = imgPosition[1] + 'px';
    bike.style.left = imgPosition[0] + 'px';
    bike.classList.add('bike');
    this._arena.appendChild(bike);
    this._bikeElement = bike;
    this._trailColor = trailColor;
    this._RAY_LIFETIME = rayLifetime;

    //img dimension properties are only available once img has loaded. we want the initial
    //dimension for future headPosition calculation so rotate only after recording the dimensions
    bike.onload = () => {
      this._imgWidth = parseFloat(
        bike.getBoundingClientRect().width.toFixed(4)
      );
      this._imgHeight = parseFloat(
        bike.getBoundingClientRect().height.toFixed(4)
      );
      this._cttSegNum = Math.floor(this._imgHeight / 2 / this._speed) + 1;

      bike.style.rotate = this._BikeRotation[direction];
    };

    return this;
  }

  //Summary: Return trail of the bike
  //Output: list of segments where each segement is an array [x1,y1,x2,y2]
  getTrail = () => {
    return this._trail;
  };

  //Summary: Return color of trail
  //Output: trail color in word or hexadecimal
  getTrailColor = () => {
    return this._trailColor;
  };

  //Summary: return head position of the bike image
  //Output: array of bike head position [x1, y1]
  getHeadPosition = () => {
    return this._headPosition;
  };

  //Summary: return center position of the bike image
  //Output: array of bike center position [x1, y1]
  getCenterPosition = () => {
    return this._centerPosition;
  };

  //Summary: return tail position of the bike image
  //Output: array of bike tail position [x1, y1]
  getTailPosition = () => {
    return this._tailPosition;
  };

  getElement = () => {
    return this._bikeElement;
  };

  setImgPosition = (imgPosition) => {
    this._imgPosition = imgPosition;
  };

  //Summary: Calculate position of bike's head, given it's direction, using image position
  //         (top left of initial img) and initial img width and height.
  //Output: array of x, y of bike's head position.

  calculateHeadPosition = () => {
    switch (this._direction) {
      case Direction.up:
        return [
          this._imgPosition[0] + this._imgWidth / 2.0,
          this._imgPosition[1]
        ];
      case Direction.down:
        return [
          this._imgPosition[0] + this._imgWidth / 2.0,
          this._imgPosition[1] + this._imgHeight
        ];
      case Direction.left:
        return [
          this._imgPosition[0] - (this._imgHeight - this._imgWidth) / 2.0,
          this._imgPosition[1] + this._imgHeight / 2.0
        ];
      case Direction.right:
        return [
          this._imgPosition[0] + (this._imgHeight + this._imgWidth) / 2.0,
          this._imgPosition[1] + this._imgHeight / 2.0
        ];
    }
  };

  calculateCenterPosition = () => {
    const position = this.calculateHeadPosition();
    switch (this._direction) {
      case Direction.up:
        position[1] = position[1] + this._imgHeight / 2;
        break;
      case Direction.down:
        position[1] = position[1] - this._imgHeight / 2;
        break;
      case Direction.left:
        position[0] = position[0] + this._imgHeight / 2;
        break;
      case Direction.right:
        position[0] = position[0] - this._imgHeight / 2;
        break;
    }
    return position;
  };

  calculateTailPosition = () => {
    const position = this.calculateHeadPosition();
    switch (this._direction) {
      case Direction.up:
        position[1] = position[1] + this._imgHeight;
        break;
      case Direction.down:
        position[1] = position[1] - this._imgHeight;
        break;
      case Direction.left:
        position[0] = position[0] + this._imgHeight;
        break;
      case Direction.right:
        position[0] = position[0] - this._imgHeight;
        break;
    }
    return position;
  };

  //Summary: Advance bike imgPosition based on bike speed and direction
  //Output: Bike's new imgPosition
  moveForward = () => {
    const bike = document.getElementById(this._bikeId);
    const oldCenterPostion = [...this._centerPosition]; //copy by value
    switch (this._direction) {
      case Direction.up:
        this._imgPosition[1] -= this._speed;
        bike.style.top = this._imgPosition[1] + 'px';
        break;
      case Direction.down:
        this._imgPosition[1] += this._speed;
        bike.style.top = this._imgPosition[1] + 'px';
        break;
      case Direction.left:
        this._imgPosition[0] -= this._speed;
        bike.style.left = this._imgPosition[0] + 'px';
        break;
      case Direction.right:
        this._imgPosition[0] += this._speed;
        bike.style.left = this._imgPosition[0] + 'px';
        break;
    }
    this._headPosition = this.calculateHeadPosition();
    this._centerPosition = this.calculateCenterPosition();
    this._tailPosition = this.calculateTailPosition();
    this._centerSeg = [...oldCenterPostion, ...this._centerPosition];

    //add newst segment to trail with a ttl
    const ttl = new Date(new Date().getTime() + this._RAY_LIFETIME).getTime();
    this._trail.push([...this._centerSeg, ttl]);
  };

  removeExpiredTrail = () => {
    const now = new Date().getTime();
    const segToRemove = [];
    while (this._trail[0][4] < now) {
      const seg = this._trail.shift();
      segToRemove.push(seg);
    }
    return segToRemove;
  };

  //Summary: Return imgPosition of the bike image
  //Output: An array [left, top] of img position in pixel
  getImgPosition = () => {
    return this._imgPosition;
  };

  //Summary: update bike's moving direction
  //Input: a valid direction from the Direction enum
  //Output: Null
  updateDirection = (key) => {
    switch (key) {
      case this._kbControl[0]:
        this._direction = this.getNewDirection(-1);
        break;
      case this._kbControl[1]:
        this._direction = this.getNewDirection(1);
        break;
    }
    const bike = document.getElementById(this._bikeId);
    bike.style.rotate = this._BikeRotation[this._direction];
  };

  //Summary: update bike's moving direction
  //Input: an increment or decrement of current direction along the DIR_ARRAY
  //Output: updated bike direction
  getNewDirection = (change) => {
    const dirIndex = this._DIR_ARRAY.indexOf(this._direction);
    if (dirIndex == 0 && change == -1) {
      return this._DIR_ARRAY[3];
    } else {
      return this._DIR_ARRAY[(dirIndex + change) % 4];
    }
  };

  //Summary: Check if a bike's last movement collided with another game object (i.e. obstacles).
  //Input: centerSeg is an array [x_old, y_old, x_new, y_new], reprsenting bike center's last movement
  //       obstacle isa segment [x1,y1,x2,y2], e.g. wall or ray segment
  //Output: boolean of whether a collision happend
  //Assumption: assumed every obstacle segment is a horizontal or vertical line.
  hasCollided = (obstacle) => {
    //ignore trail created between bike center to bike tail during collision calculation
    const trailToIgnore =
      this._trail.length >= this._cttSegNum
        ? this._trail.slice(this._trail.length - this._cttSegNum)
        : this._trail;
    if (trailToIgnore.includes(obstacle)) {
      return false;
    }

    //object is also a segment
    const bikeDir =
      this._headPosition[0] - this._tailPosition[0] == 0
        ? 'vertical'
        : 'horizontal';
    const objDir = obstacle[2] - obstacle[0] == 0 ? 'vertical' : 'horizontal';

    const minObjX = Math.min(obstacle[0], obstacle[2]);
    const maxObjX = Math.max(obstacle[0], obstacle[2]);
    const minObjY = Math.min(obstacle[1], obstacle[3]);
    const maxObjY = Math.max(obstacle[1], obstacle[3]);
    const minBikeX = Math.min(this._tailPosition[0], this._headPosition[0]);
    const maxBikeX = Math.max(this._tailPosition[0], this._headPosition[0]);
    const minBikeY = Math.min(this._tailPosition[1], this._headPosition[1]);
    const maxBikeY = Math.max(this._tailPosition[1], this._headPosition[1]);

    switch (true) {
      case bikeDir === 'horizontal' && objDir === 'vertical':
        if (
          this._headPosition[1] >= minObjY &&
          this._headPosition[1] <= maxObjY &&
          minBikeX <= obstacle[0] &&
          maxBikeX >= obstacle[0]
        ) {
          return true;
        }

      case bikeDir === 'vertical' && objDir === 'horizontal':
        if (
          this._headPosition[0] >= minObjX &&
          this._headPosition[0] <= maxObjX &&
          minBikeY <= obstacle[1] &&
          maxBikeY >= obstacle[1]
        ) {
          return true;
        }

      case bikeDir === 'vertical' && objDir === 'vertical':
        const bikeX = this._headPosition[0];
        const objX = obstacle[0];
        if (bikeX === objX) {
          if (
            (maxBikeY >= minObjY && maxBikeY <= maxObjY) ||
            (minBikeY >= minObjY && minBikeY <= maxObjY)
          ) {
            return true;
          }
        }

      case bikeDir === 'horizontal' && objDir === 'horizontal':
        const bikeY = this._headPosition[1];
        const objY = obstacle[1];
        if (bikeY === objY) {
          if (
            (maxBikeX >= minObjX && maxBikeX <= maxObjX) ||
            (minBikeX >= minObjX && minBikeX <= maxObjX)
          ) {
            return true;
          }
        }

      default:
        return false;
    }
  };
}
