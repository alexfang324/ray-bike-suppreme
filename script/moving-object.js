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
}
