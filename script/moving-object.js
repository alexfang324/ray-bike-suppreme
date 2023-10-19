import { Direction, ImgRotationAngle } from './enum.js';

export default class MovingObject {
  _imgPosition; //top left position of img when it's first loaded
  _direction; //current direction of object's motion
  _speed; //num pixel bike moves per game interation
  _imgWidth; //img width when it's first loaded
  _imgHeight; //img height when it's first loaded
  _headPosition; //[x,y] position of object's head
  _centerPosition; //[x,y] position of object's center
  _tailPosition; //[x,y] position of object's tail
  _element; //img html element of the object
  _arena;

  constructor(imgPosition, direction, speed, imgSrc) {
    this._imgPosition = [...imgPosition];
    this._direction = direction;
    this._speed = speed;
    this._headPosition = this.calculateHeadPosition();
    this._centerPosition = this.calculateCenterPosition();
    this._tailPosition = this.calculateTailPosition();

    this._arena = document.getElementById('arena');
    const obj = document.createElement('img');
    obj.src = imgSrc;
    obj.style.top = imgPosition[1] + 'px';
    obj.style.left = imgPosition[0] + 'px';
    this._arena.appendChild(obj);
    this._element = obj;

    //img dimension properties are only available once img has loaded. we want the initial
    //dimension for future headPosition calculation so rotate only after recording the dimensions
    obj.onload = () => {
      this._imgWidth = parseFloat(obj.getBoundingClientRect().width.toFixed(4));
      this._imgHeight = parseFloat(
        obj.getBoundingClientRect().height.toFixed(4)
      );
      this._cttSegNum = Math.floor(this._imgHeight / 2 / this._speed) + 1;

      obj.style.rotate = ImgRotationAngle[direction];
    };
  }

  getImgPosition = () => {
    return this._imgPosition;
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
    return this._element;
  };

  getDirection = () => {
    return this._direction;
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

  moveForward = (obj) => {
    const objElement = obj.getElement();

    switch (this._direction) {
      case Direction.up:
        this._imgPosition[1] -= this._speed;
        objElement.style.top = this._imgPosition[1] + 'px';
        break;
      case Direction.down:
        this._imgPosition[1] += this._speed;
        objElement.style.top = this._imgPosition[1] + 'px';
        break;
      case Direction.left:
        this._imgPosition[0] -= this._speed;
        objElement.style.left = this._imgPosition[0] + 'px';
        break;
      case Direction.right:
        this._imgPosition[0] += this._speed;
        objElement.style.left = this._imgPosition[0] + 'px';
        break;
    }
    this._headPosition = this.calculateHeadPosition();
    this._centerPosition = this.calculateCenterPosition();
    this._tailPosition = this.calculateTailPosition();
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

    const bikeDir =
      this._headPosition[0] - this._tailPosition[0] == 0
        ? 'vertical'
        : 'horizontal';
    const obsDir = obstacle.x2 - obstacle.x1 == 0 ? 'vertical' : 'horizontal';

    const minObjX = Math.min(obstacle.x1, obstacle.x2);
    const maxObjX = Math.max(obstacle.x1, obstacle.x2);
    const minObjY = Math.min(obstacle.y1, obstacle.y2);
    const maxObjY = Math.max(obstacle.y1, obstacle.y2);
    const minBikeX = Math.min(this._tailPosition[0], this._headPosition[0]);
    const maxBikeX = Math.max(this._tailPosition[0], this._headPosition[0]);
    const minBikeY = Math.min(this._tailPosition[1], this._headPosition[1]);
    const maxBikeY = Math.max(this._tailPosition[1], this._headPosition[1]);

    switch (true) {
      case bikeDir === 'horizontal' && obsDir === 'vertical':
        if (
          this._headPosition[1] >= minObjY &&
          this._headPosition[1] <= maxObjY &&
          minBikeX <= obstacle.x1 &&
          maxBikeX >= obstacle.x1
        ) {
          return true;
        }

      case bikeDir === 'vertical' && obsDir === 'horizontal':
        if (
          this._headPosition[0] >= minObjX &&
          this._headPosition[0] <= maxObjX &&
          minBikeY <= obstacle.y1 &&
          maxBikeY >= obstacle.y1
        ) {
          return true;
        }

      case bikeDir === 'vertical' && obsDir === 'vertical':
        const bikeX = this._headPosition[0];
        const objX = obstacle.x1;
        if (bikeX === objX) {
          if (
            (maxBikeY >= minObjY && maxBikeY <= maxObjY) ||
            (minBikeY >= minObjY && minBikeY <= maxObjY)
          ) {
            return true;
          }
        }

      case bikeDir === 'horizontal' && obsDir === 'horizontal':
        const bikeY = this._headPosition[1];
        const objY = obstacle.y1;
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
