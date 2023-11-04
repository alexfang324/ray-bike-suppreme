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
  boundaries; //array of [x1,x2,y1,y2] line segments that defines the img boundaries of object

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

  calculateImgBoundaries() {
    //calculate boundaries of the bike image
    const x1 = this.imgPosition[0];
    const y1 = this.imgPosition[1];
    let x2;
    let y2;
    //depending on current object diretion, x2 and y2 relates to initial img height and width differently
    switch (this.direction) {
      case Direction.up:
      case Direction.down:
        x2 = this.imgPosition[0] + this.imgWidth;
        y2 = this.imgPosition[1] + this.imgHeight;
        break;
      case Direction.left:
      case Direction.right:
        x2 = this.imgPosition[0] + (this.imgWidth + this.imgHeight) / 2;
        y2 = this.imgPosition[1] + (this.imgWidth + this.imgHeight) / 2;
        break;
    }
    //return the four segments that forms the box around the object image
    return [
      [x1, y1, x2, y1],
      [x2, y1, x2, y2],
      [x2, y2, x1, y2],
      [x1, y2, x1, y1]
    ];
  }

  //move object forward by updating DOM position and its related class properties
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
    this.boundaries = this.calculateImgBoundaries();
  }

  hasCollided(obstacle) {
    const obsPosition = [obstacle.x1, obstacle.y1, obstacle.x2, obstacle.y2];
    const hasCollided = this.boundaries.map((b) => {
      return this.hasCrossed(b, obsPosition);
    });
    return hasCollided.includes(true);
  }

  hasCrossed(seg1, seg2) {
    const seg1Dir = seg1[2] - seg1[0] == 0 ? 'vertical' : 'horizontal';
    const seg2Dir = seg2[2] - seg2[0] == 0 ? 'vertical' : 'horizontal';

    const minSeg1X = Math.min(seg1[0], seg1[2]);
    const maxSeg1X = Math.max(seg1[0], seg1[2]);
    const minSeg1Y = Math.min(seg1[1], seg1[3]);
    const maxSeg1Y = Math.max(seg1[1], seg1[3]);
    const minSeg2X = Math.min(seg2[0], seg2[2]);
    const maxSeg2X = Math.max(seg2[0], seg2[2]);
    const minSeg2Y = Math.min(seg2[1], seg2[3]);
    const maxSeg2Y = Math.max(seg2[1], seg2[3]);

    switch (true) {
      case seg1Dir === 'horizontal' && seg2Dir === 'vertical':
        if (
          seg1[1] >= minSeg2Y &&
          seg1[1] <= maxSeg2Y &&
          minSeg1X <= seg2[0] &&
          maxSeg1X >= seg2[0]
        ) {
          return true;
        }

      case seg1Dir === 'vertical' && seg2Dir === 'horizontal':
        if (
          seg1[0] >= minSeg2X &&
          seg1[0] <= maxSeg2X &&
          minSeg1Y <= seg2[1] &&
          maxSeg1Y >= seg2[1]
        ) {
          return true;
        }

      case seg1Dir === 'vertical' && seg2Dir === 'vertical':
        const seg1X = seg1[0];
        const seg2X = seg2[0];
        if (seg1X === seg2X) {
          if (
            (maxSeg1Y >= minSeg2Y && maxSeg1Y <= maxSeg2Y) ||
            (minSeg1Y >= minSeg2Y && minSeg1Y <= maxSeg2Y)
          ) {
            return true;
          }
        }

      case seg1Dir === 'horizontal' && seg2Dir === 'horizontal':
        const seg1Y = seg1[1];
        const seg2Y = seg2[1];
        if (seg1Y === seg2Y) {
          if (
            (maxSeg1X >= minSeg2X && maxSeg1X <= maxSeg2X) ||
            (minSeg1X >= minSeg2X && minSeg1X <= maxSeg2X)
          ) {
            return true;
          }
        }

      default:
        return false;
    }
  }
}
