'use strict';
import { ImgRotationAngle, Direction } from './enum.js';
import MovableObject from './movable-object.js';
import Obstacle from './obstacle.js';

export default class Bike extends MovableObject {
  DIR_ARRAY = ['up', 'right', 'down', 'left']; //order of bike dir as user hits the right key

  bikeId;
  RAY_LIFETIME;
  projectileLeft;
  kbControl; //an array [up,down,left,right] keyboard control key of bike
  bikeId; //id field of bike's img html element
  centerSeg; //[x_old, y_old, x_new, y_new],evolution of bike center position during last interation
  trail; // a list of Obstacle object representing the segment the bike has travelled over
  trailColor; //color of the trail
  cttSegNum; //number of segments needed to span from bike center to bike tail

  constructor(
    imgPosition,
    direction,
    speed,
    bikeId,
    kbControl,
    imgSrc,
    trailColor,
    rayLifetime,
    numProjectile,
    emitProjectile
  ) {
    super(imgPosition, direction, speed, imgSrc);
    this.kbControl = kbControl;
    this.bikeId = bikeId;
    this.centerSeg = [...this.centerPosition, ...this.centerPosition];
    this.trail = [];
    this.bikeId = bikeId;
    const bikeElement = this.element;
    bikeElement.id = bikeId;
    bikeElement.classList.add('bike');
    this.trailColor = trailColor;
    this.RAY_LIFETIME = rayLifetime;
    this.projectileLeft = numProjectile;
    this.emitProjectile = emitProjectile; //callback func for emitting a projectile

    //img dimension properties are only available once img has loaded. we want the initial
    //dimension for future headPosition calculation so rotate only after recording the dimensions
    bikeElement.onload = () => {
      const imgSpec = bikeElement.getBoundingClientRect();
      this.imgWidth = imgSpec.width;
      this.imgHeight = imgSpec.height;

      //calculate how many trail segment behind the bike to ignore during collision check
      this.cttSegNum =
        Math.floor((this.imgHeight + this.imgWidth) / 2 / this.speed) + 10;
      //rotate loaded image to its initial direction
      bikeElement.style.rotate = ImgRotationAngle[direction];
      this.imgPosition = this.calculateImgPosBasedOnNewDir();
      this.boundaries = this.calculateImgBoundaries();
    };
  }

  getTrailForCollisionCheck() {
    //ignore trail created between bike center to bike tail for collision calculation purpose
    const trail =
      this.trail.length >= this.cttSegNum
        ? this.trail.slice(0, this.trail.length - this.cttSegNum)
        : [];
    return trail;
  }

  moveForwardAndAddTrail() {
    const oldCenterPostion = [...this.centerPosition]; //copy by value
    this.moveForward(this);
    this.centerSeg = [...oldCenterPostion, ...this.centerPosition];

    //add newst segment to trail with a ttl
    const ttl = new Date(new Date().getTime() + this.RAY_LIFETIME).getTime();
    this.trail.push(new Obstacle(...this.centerSeg, 'trail', this.bikeId, ttl));
  }

  //remove expired trail based on trail ttl
  removeExpiredTrail() {
    const now = new Date().getTime();
    const segToRemove = [];
    while (this.trail[0].ttl < now) {
      const seg = this.trail.shift();
      segToRemove.push(seg);
    }
    return segToRemove;
  }

  //Summary: update bike's attribute based on key press
  //Input: key press event
  //Output: Null
  updateBikeEvent(key) {
    switch (key.toLowerCase()) {
      case this.kbControl[0].toLowerCase():
        this.direction = this.getNewDirection(-1);
        break;
      case this.kbControl[1].toLowerCase():
        this.direction = this.getNewDirection(1);
        break;
      case this.kbControl[2].toLowerCase():
        if (this.projectileLeft > 0) {
          this.emitProjectile(this);
          this.projectileLeft--;
        }
        break;
    }
    this.element.style.rotate = ImgRotationAngle[this.direction];
    const imgSpec = this.element.getBoundingClientRect();
    // this.imgPosition = [imgSpec.left-this.arena.style.left-200, imgSpec.top-this.arena.style.top-200];
    this.imgPosition = this.calculateImgPosBasedOnNewDir();
  }

  //Summary: update bike's moving direction
  //Input: an increment or decrement of current direction along the DIR_ARRAY
  //Output: updated bike direction
  getNewDirection(change) {
    const dirIndex = this.DIR_ARRAY.indexOf(this.direction);
    if (dirIndex == 0 && change == -1) {
      return this.DIR_ARRAY[3];
    } else {
      return this.DIR_ARRAY[(dirIndex + change) % 4];
    }
  }

    //calculate the new [left,top] position of an image when a new direction is given
    calculateImgPosBasedOnNewDir(){
      switch (this.direction){
        //when img points from left/right to top/down
        case Direction.up:
        case Direction.down:
          return [this.imgPosition[0] + (this.imgHeight - this.imgWidth) / 2,
        this.imgPosition[1] + (this.imgWidth - this.imgHeight) / 2];
        //when img points from top/down to left/right
        case Direction.left:
        case Direction.right:
          return [this.imgPosition[0] + (this.imgWidth - this.imgHeight) / 2,
          this.imgPosition[1] + (this.imgHeight - this.imgWidth) / 2];
      }
    }
}
