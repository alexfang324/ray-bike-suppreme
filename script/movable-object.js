import { Direction, ImgRotationAngle } from './enum.js';

export default class MovableObject {
  imgPosition; //top left position of img when it's first loaded
  direction; //current direction of object's motion
  speed; //num pixel bike moves per game interation
  imgWidth; //img width when it's first loaded
  imgHeight; //img height when it's first loaded
  headPosition; //[x,y] position of object's head
  centerPosition; //[x,y] position of object's center
  tailPosition; //[x,y] position of object's tail
  element; //img html element of the object
  arena;

  constructor(imgPosition, direction, speed, imgSrc) {
    this.imgPosition = [...imgPosition];
    this.direction = direction;
    this.speed = speed;
    this.headPosition = this.calculateHeadPosition();
    this.centerPosition = this.calculateCenterPosition();
    this.tailPosition = this.calculateTailPosition();

    this.arena = document.getElementById('arena');
    const obj = document.createElement('img');
    obj.src = imgSrc;
    obj.style.left = imgPosition[0] + 'px';
    obj.style.top = imgPosition[1] + 'px';
    this.arena.appendChild(obj);
    this.element = obj;
  }

  //Summary: Calculate position of bike's head, given it's direction, using image position
  //         (top left of initial img) and initial img width and height.
  //Output: array of x, y of bike's head position.

  calculateHeadPosition() {
    switch (this.direction) {
      case Direction.up:
        return [this.imgPosition[0] + this.imgWidth / 2.0, this.imgPosition[1]];
      case Direction.down:
        return [
          this.imgPosition[0] + this.imgWidth / 2.0,
          this.imgPosition[1] + this.imgHeight
        ];
      case Direction.left:
        return [
          this.imgPosition[0] - (this.imgHeight - this.imgWidth) / 2.0,
          this.imgPosition[1] + this.imgHeight / 2.0
        ];
      case Direction.right:
        return [
          this.imgPosition[0] + (this.imgHeight + this.imgWidth) / 2.0,
          this.imgPosition[1] + this.imgHeight / 2.0
        ];
    }
  }

  calculateCenterPosition() {
    const position = this.calculateHeadPosition();
    switch (this.direction) {
      case Direction.up:
        position[1] = position[1] + this.imgHeight / 2;
        break;
      case Direction.down:
        position[1] = position[1] - this.imgHeight / 2;
        break;
      case Direction.left:
        position[0] = position[0] + this.imgHeight / 2;
        break;
      case Direction.right:
        position[0] = position[0] - this.imgHeight / 2;
        break;
    }
    return position;
  }

  calculateTailPosition() {
    const position = this.calculateHeadPosition();
    switch (this.direction) {
      case Direction.up:
        position[1] = position[1] + this.imgHeight;
        break;
      case Direction.down:
        position[1] = position[1] - this.imgHeight;
        break;
      case Direction.left:
        position[0] = position[0] + this.imgHeight;
        break;
      case Direction.right:
        position[0] = position[0] - this.imgHeight;
        break;
    }
    return position;
  }

  moveForward(obj) {
    const objElement = obj.element;
    switch (this.direction) {
      case Direction.up:
        this.imgPosition[1] -= this.speed;
        objElement.style.top = this.imgPosition[1] + 'px';
        break;
      case Direction.down:
        this.imgPosition[1] += this.speed;
        objElement.style.top = this.imgPosition[1] + 'px';
        break;
      case Direction.left:
        this.imgPosition[0] -= this.speed;
        objElement.style.left = this.imgPosition[0] + 'px';
        break;
      case Direction.right:
        this.imgPosition[0] += this.speed;
        objElement.style.left = this.imgPosition[0] + 'px';
        break;
    }
    this.headPosition = this.calculateHeadPosition();
    this.centerPosition = this.calculateCenterPosition();
    this.tailPosition = this.calculateTailPosition();
  }

  //Summary: Check if a bike's last movement collided with another game object (i.e. obstacles).
  //Input: centerSeg is an array [x_old, y_old, x_new, y_new], reprsenting bike center's last movement
  //       obstacle isa segment [x1,y1,x2,y2], e.g. wall or ray segment
  //Output: boolean of whether a collision happend
  //Assumption: assumed every obstacle segment is a horizontal or vertical line.
  hasCollided(obstacle) {
    const bikeDir =
      this.headPosition[0] - this.tailPosition[0] == 0
        ? 'vertical'
        : 'horizontal';
    const obsDir = obstacle.x2 - obstacle.x1 == 0 ? 'vertical' : 'horizontal';

    const minObjX = Math.min(obstacle.x1, obstacle.x2);
    const maxObjX = Math.max(obstacle.x1, obstacle.x2);
    const minObjY = Math.min(obstacle.y1, obstacle.y2);
    const maxObjY = Math.max(obstacle.y1, obstacle.y2);
    const minBikeX = Math.min(this.tailPosition[0], this.headPosition[0]);
    const maxBikeX = Math.max(this.tailPosition[0], this.headPosition[0]);
    const minBikeY = Math.min(this.tailPosition[1], this.headPosition[1]);
    const maxBikeY = Math.max(this.tailPosition[1], this.headPosition[1]);

    switch (true) {
      case bikeDir === 'horizontal' && obsDir === 'vertical':
        if (
          this.headPosition[1] >= minObjY &&
          this.headPosition[1] <= maxObjY &&
          minBikeX <= obstacle.x1 &&
          maxBikeX >= obstacle.x1
        ) {
          return true;
        }

      case bikeDir === 'vertical' && obsDir === 'horizontal':
        if (
          this.headPosition[0] >= minObjX &&
          this.headPosition[0] <= maxObjX &&
          minBikeY <= obstacle.y1 &&
          maxBikeY >= obstacle.y1
        ) {
          return true;
        }

      case bikeDir === 'vertical' && obsDir === 'vertical':
        const bikeX = this.headPosition[0];
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
        const bikeY = this.headPosition[1];
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
  }
}
