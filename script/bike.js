'use strict';
import { ImgRotationAngle } from './enum.js';
import MovingObject from './moving-object.js';
import Obstacle from './obstacle.js';

export default class Bike extends MovingObject {
  _bikeId;
  _DIR_ARRAY = ['up', 'right', 'down', 'left']; //order of bike dir as user hits the right key
  _RAY_LIFETIME;
  _kbControl; //an array [up,down,left,right] keyboard control key of bike
  _bikeId; //id field of bike's img html element
  _centerSeg; //[x_old, y_old, x_new, y_new],evolution of bike center position during last interation
  _trail; // a list of Obstacle object representing the segment the bike has travelled over
  _trailColor; //color of the trail
  _cttSegNum; //number of segments needed to span from bike center to bike tail

  constructor(
    imgPosition,
    direction,
    speed,
    bikeId,
    kbControl,
    imgSrc,
    trailColor,
    rayLifetime,
    emitProjectile
  ) {
    super(imgPosition, direction, speed, imgSrc);
    this._kbControl = kbControl;
    this._bikeId = bikeId;
    this._centerSeg = [...this._centerPosition, ...this._centerPosition];
    this._trail = [];
    this._bikeId = bikeId;
    const bikeElement = this.getElement();
    bikeElement.id = bikeId;
    bikeElement.classList.add('bike');
    this._trailColor = trailColor;
    this._RAY_LIFETIME = rayLifetime;
    this.emitProjectile = emitProjectile; //callback func for emitting a projectile

    //img dimension properties are only available once img has loaded. we want the initial
    //dimension for future headPosition calculation so rotate only after recording the dimensions
    bikeElement.onload = () => {
      this._imgWidth = parseFloat(
        bikeElement.getBoundingClientRect().width.toFixed(4)
      );
      this._imgHeight = parseFloat(
        bikeElement.getBoundingClientRect().height.toFixed(4)
      );
      this._cttSegNum = Math.floor(this._imgHeight / 2 / this._speed) + 1;

      bikeElement.style.rotate = ImgRotationAngle[direction];
    };
  }

  //Summary: Return trail of the bike
  //Output: list of segments where each segement is an array [x1,y1,x2,y2]
  getTrail = () => {
    //ignore trail created between bike center to bike tail for collision calculation purpose
    return this._trail;
  };

  getTrailForCollisionCheck = () => {
    //ignore trail created between bike center to bike tail for collision calculation purpose
    const trail =
      this._trail.length >= this._cttSegNum
        ? this._trail.slice(0, this._trail.length - this._cttSegNum)
        : [];
    return trail;
  };

  //Summary: Return color of trail
  //Output: trail color in word or hexadecimal
  getTrailColor = () => {
    return this._trailColor;
  };

  moveForwardAndAddTrail = () => {
    const oldCenterPostion = [...this._centerPosition]; //copy by value
    this.moveForward(this);
    this._centerSeg = [...oldCenterPostion, ...this._centerPosition];

    //add newst segment to trail with a ttl
    const ttl = new Date(new Date().getTime() + this._RAY_LIFETIME).getTime();
    this._trail.push(new Obstacle(...this._centerSeg, null, null, ttl));
  };

  removeExpiredTrail = () => {
    const now = new Date().getTime();
    const segToRemove = [];
    while (this._trail[0].ttl < now) {
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

  //Summary: update bike's attribute based on key press
  //Input: key press event
  //Output: Null
  updateBikeEvent = (key) => {
    switch (key.toLowerCase()) {
      case this._kbControl[0].toLowerCase():
        this._direction = this.getNewDirection(-1);
        break;
      case this._kbControl[1].toLowerCase():
        this._direction = this.getNewDirection(1);
        break;
      case this._kbControl[2].toLowerCase():
        this.emitProjectile(this);
        break;
    }
    const bike = document.getElementById(this._bikeId);
    bike.style.rotate = ImgRotationAngle[this._direction];
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
}
