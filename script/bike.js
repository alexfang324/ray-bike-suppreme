'use strict';
import { ObstacleType } from './enum.js';
import MovableObject from './movable-object.js';
import Obstacle from './obstacle.js';

export default class Bike extends MovableObject {
  DIR_ARRAY = ['up', 'right', 'down', 'left']; //order of bike dir as user hits the right key
  RAY_LIFETIME;
  projectileLeft;
  kbControl; //an array [up,down,left,right] keyboard control key of bike
  centerSeg; //[x_old, y_old, x_new, y_new],evolution of bike center position during last interation
  trail; // a list of Obstacle object representing the segment the bike has travelled over
  trailColor; //color of the trail
  cttSegNum; //number of segments needed to span from bike center to bike tail

  constructor(
    id,
    groupId,
    objPosition,
    direction,
    speed,
    kbControl,
    imgSrc,
    trailColor,
    rayLifetime,
    numProjectile,
    emitProjectile
  ) {
    super(id, groupId, objPosition, direction, speed, imgSrc);
    this.kbControl = kbControl;
    this.centerSeg = [...this.centerPosition, ...this.centerPosition];
    this.trail = [];
    const bikeElement = this.element;
    bikeElement.id = id;
    bikeElement.classList.add('bike');
    this.trailColor = trailColor;
    this.RAY_LIFETIME = rayLifetime;
    this.projectileLeft = numProjectile;
    this.emitProjectile = emitProjectile; //callback func for emitting a projectile
    this.obsType = ObstacleType.bike;

    //img dimension properties are only available once img has loaded. we want the initial
    //dimension for future headPosition calculation so rotate only after recording the dimensions
    bikeElement.onload = () => {
      const imgSpec = bikeElement.getBoundingClientRect();
      this.objWidth = imgSpec.width;
      this.objHeight = imgSpec.height;

      //calculate how many trail segment behind the bike to ignore during collision check
      this.cttSegNum =
        Math.floor((this.objHeight + this.objWidth) / 2 / this.speed) + 1;
      //rotate loaded image to its initial direction
      this.rotate();
      this.boundaries = this.calculateBoundaryObstacles();
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
    this.trail.push(
      new Obstacle(this.centerSeg, ObstacleType.trail, this.id, ttl)
    );
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
        this.rotate();
        break;
      case this.kbControl[1].toLowerCase():
        this.direction = this.getNewDirection(1);
        this.rotate();
        break;
      case this.kbControl[2].toLowerCase():
        if (this.projectileLeft > 0) {
          this.emitProjectile(this);
          this.projectileLeft--;
        }
        break;
    }
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
}
