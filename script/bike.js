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
  #cttSegNum; //number of segments needed to span from bike center to bike tail

  #BikeRotation = Object.freeze({
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
    this.#imgPosition = imgPosition;
    this.#direction = direction;
    this.#headPosition = this.calculateHeadPosition();
    this.#centerPosition = this.calculateCenterPosition();
    this.#tailPosition = this.calculateTailPosition();
    this.#kbControl = kbControl;
    this.#speed = speed;
    this.#bikeId = bikeId;
    this.#centerSeg = [...this.#centerPosition, ...this.#centerPosition];
    this.#trail = [];
    this.#arena = document.getElementById('arena');
    const bike = document.createElement('img');
    bike.id = bikeId;
    bike.src = imgSrc;
    bike.style.top = imgPosition[1] + 'px';
    bike.style.left = imgPosition[0] + 'px';
    bike.classList.add('bike');
    this.#arena.appendChild(bike);
    this.#bikeElement = bike;
    this.#trailColor = trailColor;

    //img dimension properties are only available once img has loaded. we want the initial
    //dimension for future headPosition calculation so rotate only after recording the dimensions
    bike.onload = () => {
      this.#imgWidth = parseFloat(
        bike.getBoundingClientRect().width.toFixed(4)
      );
      this.#imgHeight = parseFloat(
        bike.getBoundingClientRect().height.toFixed(4)
      );
      this.#cttSegNum = Math.floor(this.#imgHeight / 2 / this.#speed) + 1;

      bike.style.rotate = this.#BikeRotation[direction];
    };

    return this;
  }

  //Summary: Return trail of the bike
  //Output: list of segments where each segement is an array [x1,y1,x2,y2]
  getTrail = () => {
    return this.#trail;
  };

  //Summary: Return color of trail
  //Output: trail color in word or hexadecimal
  getTrailColor = () => {
    return this.#trailColor;
  };

  //Summary: return head position of the bike image
  //Output: array of bike head position [x1, y1]
  getHeadPosition = () => {
    return this.#headPosition;
  };

  //Summary: return center position of the bike image
  //Output: array of bike center position [x1, y1]
  getCenterPosition = () => {
    return this.#centerPosition;
  };

  //Summary: return tail position of the bike image
  //Output: array of bike tail position [x1, y1]
  getTailPosition = () => {
    return this.#tailPosition;
  };

  //Summary: Calculate position of bike's head, given it's direction, using image position
  //         (top left of initial img) and initial img width and height.
  //Output: array of x, y of bike's head position.

  calculateHeadPosition = () => {
    switch (this.#direction) {
      case Direction.up:
        return [
          this.#imgPosition[0] + this.#imgWidth / 2.0,
          this.#imgPosition[1]
        ];
      case Direction.down:
        return [
          this.#imgPosition[0] + this.#imgWidth / 2.0,
          this.#imgPosition[1] + this.#imgHeight
        ];
      case Direction.left:
        return [
          this.#imgPosition[0] - (this.#imgHeight - this.#imgWidth) / 2.0,
          this.#imgPosition[1] + this.#imgHeight / 2.0
        ];
      case Direction.right:
        return [
          this.#imgPosition[0] + (this.#imgHeight + this.#imgWidth) / 2.0,
          this.#imgPosition[1] + this.#imgHeight / 2.0
        ];
    }
  };

  calculateCenterPosition = () => {
    const position = this.calculateHeadPosition();
    switch (this.#direction) {
      case Direction.up:
        position[1] = position[1] + this.#imgHeight / 2;
        break;
      case Direction.down:
        position[1] = position[1] - this.#imgHeight / 2;
        break;
      case Direction.left:
        position[0] = position[0] + this.#imgHeight / 2;
        break;
      case Direction.right:
        position[0] = position[0] - this.#imgHeight / 2;
        break;
    }
    return position;
  };

  calculateTailPosition = () => {
    const position = this.calculateHeadPosition();
    switch (this.#direction) {
      case Direction.up:
        position[1] = position[1] + this.#imgHeight;
        break;
      case Direction.down:
        position[1] = position[1] - this.#imgHeight;
        break;
      case Direction.left:
        position[0] = position[0] + this.#imgHeight;
        break;
      case Direction.right:
        position[0] = position[0] - this.#imgHeight;
        break;
    }
    return position;
  };

  //Summary: Advance bike imgPosition based on bike speed and direction
  //Output: Bike's new imgPosition
  moveForward = () => {
    const bike = document.getElementById(this.#bikeId);
    const oldCenterPostion = [...this.#centerPosition]; //copy by value
    switch (this.#direction) {
      case Direction.up:
        this.#imgPosition[1] -= this.#speed;
        bike.style.top = this.#imgPosition[1] + 'px';
        break;
      case Direction.down:
        this.#imgPosition[1] += this.#speed;
        bike.style.top = this.#imgPosition[1] + 'px';
        break;
      case Direction.left:
        this.#imgPosition[0] -= this.#speed;
        bike.style.left = this.#imgPosition[0] + 'px';
        break;
      case Direction.right:
        this.#imgPosition[0] += this.#speed;
        bike.style.left = this.#imgPosition[0] + 'px';
        break;
    }
    this.#headPosition = this.calculateHeadPosition();
    this.#centerPosition = this.calculateCenterPosition();
    this.#tailPosition = this.calculateTailPosition();
    this.#centerSeg = [...oldCenterPostion, ...this.#centerPosition];
    this.#trail.push(this.#centerSeg);
  };

  //Summary: Return imgPosition of the bike image
  //Output: An array [left, top] of img position in pixel
  getImgPosition = () => {
    return this.#imgPosition;
  };

  //Summary: update bike's moving direction
  //Input: a valid direction from the Direction enum
  //Output: Null
  updateDirection = (key) => {
    switch (key) {
      case this.#kbControl[0]:
        this.#direction = Direction.up;
        break;
      case this.#kbControl[1]:
        this.#direction = Direction.down;
        break;
      case this.#kbControl[2]:
        this.#direction = Direction.left;
        break;
      case this.#kbControl[3]:
        this.#direction = Direction.right;
    }
    const bike = document.getElementById(this.#bikeId);
    bike.style.rotate = this.#BikeRotation[this.#direction];
  };

  //Summary: Check if a bike's last movement collided with another game object (i.e. obstacles).
  //Input: centerSeg is an array [x_old, y_old, x_new, y_new], reprsenting bike center's last movement
  //       obstacle isa segment [x1,y1,x2,y2], e.g. wall or ray segment
  //Output: boolean of whether a collision happend
  //Assumption: assumed every obstacle segment is a horizontal or vertical line.
  hasCollided = (obstacle) => {
    //ignore trail created between bike center to bike tail during collision calculation
    const trailToIgnore =
      this.#trail.length >= this.#cttSegNum
        ? this.#trail.slice(this.#trail.length - this.#cttSegNum)
        : this.#trail;
    if (trailToIgnore.includes(obstacle)) {
      return false;
    }

    //object is also a segment
    const bikeDir =
      this.#headPosition[0] - this.#tailPosition[0] == 0
        ? 'vertical'
        : 'horizontal';
    const objDir = obstacle[2] - obstacle[0] == 0 ? 'vertical' : 'horizontal';

    const minObjX = Math.min(obstacle[0], obstacle[2]);
    const maxObjX = Math.max(obstacle[0], obstacle[2]);
    const minObjY = Math.min(obstacle[1], obstacle[3]);
    const maxObjY = Math.max(obstacle[1], obstacle[3]);
    const minBikeX = Math.min(this.#tailPosition[0], this.#headPosition[0]);
    const maxBikeX = Math.max(this.#tailPosition[0], this.#headPosition[0]);
    const minBikeY = Math.min(this.#tailPosition[1], this.#headPosition[1]);
    const maxBikeY = Math.max(this.#tailPosition[1], this.#headPosition[1]);

    switch (true) {
      case bikeDir === 'horizontal' && objDir === 'vertical':
        if (
          this.#headPosition[1] >= minObjY &&
          this.#headPosition[1] <= maxObjY &&
          minBikeX <= obstacle[0] &&
          maxBikeX >= obstacle[0]
        ) {
          return true;
        }

      case bikeDir === 'vertical' && objDir === 'horizontal':
        if (
          this.#headPosition[0] >= minObjX &&
          this.#headPosition[0] <= maxObjX &&
          minBikeY <= obstacle[1] &&
          maxBikeY >= obstacle[1]
        ) {
          return true;
        }
      case bikeDir === 'vertical' && objDir === 'vertical':
        const bikeX = this.#headPosition[0];
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
        const bikeY = this.#headPosition[1];
        const objY = obstacle[1];
        if (bikeY === objY) {
          if (
            (maxBikeX >= minObjX && maxBikeX <= maxObjX) ||
            (minBikeX >= minObjX && minBikeX <= maxObjX)
          ) {
            return true;
          }
        }
    }
  };
}
