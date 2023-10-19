'use strict';
import { Direction, ImgRotationAngle } from './enum.js';
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
    const bike = this.getElement();
    bike.id = bikeId;
    bike.classList.add('bike');
    this._trailColor = trailColor;
    this._RAY_LIFETIME = rayLifetime;
    this.emitProjectile = emitProjectile; //callback func for emitting a projectile

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
