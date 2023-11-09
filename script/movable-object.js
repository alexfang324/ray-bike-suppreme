import { Direction, ImgRotationAngle, ObstacleType } from './enum.js';
import Obstacle from './obstacle.js';

export default class MovableObject {
  id; //id of this object instance
  groupId; //used to identify related MovableObject instances (bike and its projectile and boundary obstacles)
  speed; //num pixel moved per game loop interation
  direction; //current direction of object's motion
  objWidth; //img width
  objHeight; //img height
  obsType; //obstacle type for the Obstacle instances that will form its boundaries
  boundaries; //array of Obstacle instances that defines the boundaries of this object on screen
  objPosition; //top left position of object img as appeared on screen (i.e. as received through getBoundingClientRect method)
  imgPosition; //top left position of object img before rotate is performed (which doesn't change DOM top left values)
  headPosition; //[top, left] position of object's head
  centerPosition; //[top, left] position of object's center
  element; //html img element of the object
  arenaElement = document.getElementById('arena');

  constructor(id, groupId, objPosition, direction, speed, imgSrc) {
    this.id = id;
    this.groupId = groupId;
    this.objPosition = [...objPosition];
    this.imgPosition = [...objPosition];
    this.direction = direction;
    this.speed = speed;
    this.headPosition = this.calculateHeadPosition();
    this.centerPosition = this.calculateCenterPosition();

    //create html img element of this object and append to arena element
    const obj = document.createElement('img');
    obj.src = imgSrc;
    obj.style.left = objPosition[0] + 'px';
    obj.style.top = objPosition[1] + 'px';
    this.arenaElement.appendChild(obj);
    this.element = obj;
  }

  calculateHeadPosition() {
    switch (this.direction) {
      case Direction.up:
        return [this.objPosition[0] + this.objWidth / 2, this.objPosition[1]];
      case Direction.down:
        return [
          this.objPosition[0] + this.objWidth / 2,
          this.objPosition[1] + this.objHeight
        ];
      case Direction.left:
        return [this.objPosition[0], this.objPosition[1] + this.objHeight / 2];
      case Direction.right:
        return [
          this.objPosition[0] + this.objWidth,
          this.objPosition[1] + this.objHeight / 2
        ];
    }
  }

  calculateCenterPosition() {
    const position = this.calculateHeadPosition();
    switch (this.direction) {
      case Direction.up:
        position[1] = position[1] + this.objHeight / 2;
        break;
      case Direction.down:
        position[1] = position[1] - this.objHeight / 2;
        break;
      case Direction.left:
        position[0] = position[0] + this.objWidth / 2;
        break;
      case Direction.right:
        position[0] = position[0] - this.objWidth / 2;
        break;
    }
    return position;
  }

  //Summary: calculate object's boundaries using its apparent top left position on the screen
  //instead of its elemental values because css rotate doesn't change these values
  //Output: an array of Obstacle instances represent the object boundaries
  calculateBoundaryObstacles() {
    //calculate the x and y bounds of the bike image
    const x1 = this.objPosition[0];
    const y1 = this.objPosition[1];
    const x2 = this.objPosition[0] + this.objWidth;
    const y2 = this.objPosition[1] + this.objHeight;
    //create the array
    return [
      new Obstacle([x1, y1, x2, y1], this.obsType, this.groupId),
      new Obstacle([x2, y1, x2, y2], this.obsType, this.groupId),
      new Obstacle([x2, y2, x1, y2], this.obsType, this.groupId),
      new Obstacle([x1, y2, x1, y1], this.obsType, this.groupId)
    ];
  }

  //Summary: calculate the new [left,top] position and dimension of the object when a new
  //direction is given
  rotate() {
    this.element.style.transform = `rotate(${
      ImgRotationAngle[this.direction]
    })`;
    // update obj width and height accordingly
    const imgSpec = this.element.getBoundingClientRect();
    this.objWidth = imgSpec.width;
    this.objHeight = imgSpec.height;

    //update the expected [left,top] position of the bike object. We don't update the image element top
    //left position because even though the displayed image position has changed, we did it through
    //css rotate from the original top left position when the img was in its up-right position.
    //The actual image top left position hasn't changed
    const arenaSpec = this.arenaElement.getBoundingClientRect();
    this.objPosition = [
      imgSpec.left - arenaSpec.left,
      imgSpec.top - arenaSpec.top
    ];
  }

  //Summary: move object forward by updating DOM position and its related position and
  //boundaries properties
  moveForward(obj) {
    const objElement = obj.element;
    switch (this.direction) {
      case Direction.up:
        this.objPosition[1] -= this.speed;
        this.imgPosition[1] -= this.speed;
        objElement.style.top = this.imgPosition[1] + 'px';
        break;
      case Direction.down:
        this.objPosition[1] += this.speed;
        this.imgPosition[1] += this.speed;
        objElement.style.top = this.imgPosition[1] + 'px';
        break;
      case Direction.left:
        this.objPosition[0] -= this.speed;
        this.imgPosition[0] -= this.speed;
        objElement.style.left = this.imgPosition[0] + 'px';
        break;
      case Direction.right:
        this.objPosition[0] += this.speed;
        this.imgPosition[0] += this.speed;
        objElement.style.left = this.imgPosition[0] + 'px';
        break;
    }
    this.headPosition = this.calculateHeadPosition();
    this.centerPosition = this.calculateCenterPosition();
    this.boundaries = this.calculateBoundaryObstacles();
  }

  //Summary: check if any of the object's boundary has collided with the given obstacle
  //Input: an Obstacle instance
  hasCollided(obstacle) {
    //return false if bike is seeing its own boundaries
    if (this.id == obstacle.ownerId && obstacle.type == ObstacleType.bike) {
      return false;
    }
    //else check for collision
    const hasCollided = this.boundaries.map((b) => {
      return this.hasCrossed(b.position, obstacle.position);
    });
    return hasCollided.includes(true);
  }

  //Summary: check if two line segments crossed (includes ends touching each other)
  //Input: both are of [x1, y1, x2, y2] format
  //Output: boolean of if they cross
  hasCrossed(seg1, seg2) {
    //determine the direction of it segment
    const seg1Dir = seg1[2] - seg1[0] == 0 ? 'vertical' : 'horizontal';
    const seg2Dir = seg2[2] - seg2[0] == 0 ? 'vertical' : 'horizontal';

    //get the x and y bounds of each segment
    const minSeg1X = Math.min(seg1[0], seg1[2]);
    const maxSeg1X = Math.max(seg1[0], seg1[2]);
    const minSeg1Y = Math.min(seg1[1], seg1[3]);
    const maxSeg1Y = Math.max(seg1[1], seg1[3]);
    const minSeg2X = Math.min(seg2[0], seg2[2]);
    const maxSeg2X = Math.max(seg2[0], seg2[2]);
    const minSeg2Y = Math.min(seg2[1], seg2[3]);
    const maxSeg2Y = Math.max(seg2[1], seg2[3]);

    switch (true) {
      //perpendicular lines cross when the y value of the horizontal line
      //is within y range of the vertical line and the x value of the vertical
      //line is within the x range of the horizontal line
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

      //parallel lines overlap(i.e. cross) when one of its ends is within the
      //range of the other line
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
