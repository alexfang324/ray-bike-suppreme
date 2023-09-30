import Direction from './direction_enum.js';

export default class Bike {
  #arena;
  #bikeElement; //img html element of the bike
  #imgPosition; //top left position of img when it's first loaded
  #imgWidth; //img width when it's first loaded
  #imgHeight; //img height when it's first loaded
  #kbControl; //an array [up,down,left,right] keyboard control key of bike
  #headPosition; //[x,y] position of bike's head
  #direction; //current direction of bike's motion
  #speed; //num pixel bike moves per game interation
  #bikeId; //id field of bike's img html element
  #prevHeadSeg; //[x_old, y_old, x_new, y_new],evolution of bike head position during last interation
  #trail; // a list of [x1,y1,x2,y2] segments the bike has travelled over
  #trailColor //color of the trail

  BikeRotation = Object.freeze({
    up: '0deg',
    right: '90deg',
    down: '180deg',
    left: '270deg'
  });

  constructor(imgPosition, direction, speed, bikeId, imgSrc,trailColor, kbControl) {
    this.imgPosition = imgPosition;
    this.direction = direction;
    this.headPosition = this.calculateHeadPosition();
    this.kbControl = kbControl;
    this.speed = speed;
    this.bikeId = bikeId;
    this.prevHeadSeg = [...this.headPosition, ...this.headPosition];
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
  getTrail = ()=>{
    return this.trail
  }

  //Summary: return head position of the bike image
  //Output: array of bike head position [x1, y1]
  getHeadPosition = () => {
    return this.headPosition;
  };

  //Summary: Return color of trail
  //Output: trail color in word or hexadecimal
  getTrailColor = ()=>{
    return this.trailColor;
  }

  //Summary: Calculate position of bike's head, given it's direction, using image position
  //         (top left of initial img) and initial img width and height.
  //Output: array of x, y of bike's head position.

  calculateHeadPosition = () =>{
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

  //Summary: Advance bike imgPosition based on bike speed and direction
  //Output: Bike's new imgPosition
  moveForward = () => {
    const bike = document.getElementById(this.bikeId);
    const oldHeadPostion = [...this.headPosition]; //copy by value
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
    this.headPosition = this.calculateHeadPosition();
    this.prevHeadSeg = [...oldHeadPostion, ...this.headPosition];
    this.trail.push(this.prevHeadSeg);
  }

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
  //Input: prevHeadSeg is an array [x_old, y_old, x_new, y_new], reprsenting bike head's last movement
  //       obstacle is either a segment [x1,y1,x2,y2], e.g. wall or ray segment, or a position (x1,y1), e.g. point-like obstacle.
  //Output: boolean of whether a collision happend
  //Assumption: assumed every obstacle segment is a horizontal or vertical line.
  hasCollided = (obstacle) => {
    let collided = false;
    if (obstacle.length == 4) {
      //object is a segment
      const bikeDir =
        this.prevHeadSeg[2] - this.prevHeadSeg[0] == 0
          ? 'vertical'
          : 'horizontal';
      const objDir = obstacle[2] - obstacle[0] == 0 ? 'vertical' : 'horizontal';

      if (bikeDir == 'horizontal' && objDir == 'vertical') {
        const minObjY = Math.min(obstacle[1], obstacle[3]);
        const maxObjY = Math.max(obstacle[1], obstacle[3]);
        const minBikeX = Math.min(this.prevHeadSeg[0], this.prevHeadSeg[2]);
        const maxBikeX = Math.max(this.prevHeadSeg[0], this.prevHeadSeg[2]);
        if (
          this.prevHeadSeg[1] >= minObjY &&
          this.prevHeadSeg[1] <= maxObjY &&
          minBikeX <= obstacle[0] &&
          maxBikeX >= obstacle[0]
        ) {
          collided = true;
        }
      }

      if (bikeDir == 'vertical' && objDir == 'horizontal') {
        const minObjX = Math.min(obstacle[0], obstacle[2]);
        const maxObjX = Math.max(obstacle[0], obstacle[2]);
        const minBikeY = Math.min(this.prevHeadSeg[1], this.prevHeadSeg[3]);
        const maxBikeY = Math.max(this.prevHeadSeg[1], this.prevHeadSeg[3]);
        if (
          this.prevHeadSeg[0] >= minObjX &&
          this.prevHeadSeg[0] <= maxObjX &&
          minBikeY <= obstacle[1] &&
          maxBikeY >= obstacle[1]
        ) {
          collided = true;
        }
      }
    } else {
      //obstacle is a single point on grid
      const sameX =
        obstacle[0] == this.prevHeadSeg[0] || obstacle[0] == this.prevHeadSeg[2]
          ? true
          : false;
      const sameY =
        obstacle[1] == this.prevHeadSeg[1] || obstacle[1] == this.prevHeadSeg[3]
          ? true
          : false;
      collided = sameX && sameY ? true : false;
    }
    return collided;
  };

}
