import Direction from './direction_enum';

export default class Bike {
  #position;
  #direction;
  #speed;

  constructor(position, direction, speed) {
    this.position = position;
    this.direction = direction;
    this.speed = speed;
    return this;
  }

  //Summary: advance bike position based on speed and direction
  //Output: bike's new position
  #moveForward() {
    switch (this.direction) {
      case Direction.up:
        this.position[1] += this.speed;
        break;
      case Direction.down:
        this.position[1] -= this.speed;
        break;
      case Direction.left:
        this.position[0] -= this.speed;
        break;
      case Direction.right:
        this.position[0] += this.speed;
        break;
    }
    return this.position;
  }

  //Summary: return position of the bike
  //Output: bike position
  getPosition = () => {
    return this.position;
  };

  //Summary: update bike's moving direction
  //Input: a valid direction from the Direction enum
  //Output: Null
  updateDirection = (dir) => {
    if (Object.values(Direction).includes(dir)) {
      this.direction = dir;
    } else {
      throw 'Invalid input direction seen in Bike.updateDirection';
    }
  };

  //Summary: check if a bike's movement will collide with one of the game object
  //Input: bikeSeg is an array [x1, y1, x2, y2], reprsent bike's movement from location (x1,y1) to (x2,y2)
  //       gameObj is either a segment [x1,y1,x2,y2], e.g. wall or ray segment, or a position (x1,y1), e.g. obstacle.
  //Output: boolean of whether the bikeSeg cross the gameObj segment or rest on a gameObj obstacle.
  //Assumption: gameObj obstacle must lie on a grid point.
  //            assume every segment only contains either a x (horizontal) or y (vertical) change and not both.
  hasCollided = (bikeSeg, gameObj) => {
    collided = false;

    if (gameObj.length == 4) {
      //object is another segment
      bikeDir = bikeSeg[2] - bikeSeg[0] == 0 ? 'vertical' : 'horizontal';
      objDir = gameObj[2] - gameObj[0] == 0 ? 'vertical' : 'horizontal';

      if (bikeDir == 'horizontal' && objDir == 'vertical') {
        minObjY = Math.min(gameObj[1], gameObj[3]);
        maxObjY = Math.max(gameObj[1], gameObj[3]);
        minBikeX = Math.min(bikeSeg[0], bikeSeg[2]);
        maxBikeX = Math.max(bikeSeg[0], bikeSeg[2]);
        if (
          bikeSeg[1] > minObjY &&
          bikeSeg[1] < maxObjY &&
          minBikeX < gameObj[0] &&
          maxBikeX > gameObj[0]
        ) {
          collided = true;
        }
      }

      if (bikeDir == 'vertical' && objDir == 'horizontal') {
        minObjX = Math.min(gameObj[0], gameObj[2]);
        maxObjX = Math.max(gameObj[0], gameObj[2]);
        minBikeY = Math.min(bikeSeg[1], bikeSeg[3]);
        maxBikeY = Math.max(bikeSeg[1], bikeSeg[3]);
        if (
          bikeSeg[0] > minObjX &&
          bikeSeg[0] < maxBikeX &&
          minBikeY < gameObj[1] &&
          maxBikeY > gameObj[1]
        ) {
          collided = true;
        }
      }
    } else {
      //object is a obstacle(single position) on grid
      sameX =
        gameObj[0] == bikeSeg[0] || gameObj[0] == bikeSeg[2] ? true : false;
      sameY =
        gameObj[1] == bikeSeg[1] || gameObj[1] == bikeSeg[3] ? true : false;
      collided = sameX && sameY ? true : false;
    }
    return collided;
  };
}
