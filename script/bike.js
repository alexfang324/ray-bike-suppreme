'use strict';
import { ObstacleType } from './enum.js';
import MovableObject from './movable-object.js';
import Obstacle from './obstacle.js';

export default class Bike extends MovableObject {
  DIR_ARRAY = ['up', 'right', 'down', 'left']; //sequence of bike direction as it turns right
  RAY_LIFETIME; //time to live value of a ray segment
  projectileLeft; //number of projectiles still available for use
  kbControl; //an array holding the [up, down, left, right] keyboard control of the bike
  centerSeg; //an array [x_old, y_old, x_new, y_new] holding the bike's previous and currentcenter position of the bike image elment
  trail; // a list of Obstacle objects representing the ray segments the bike leaves behind
  trailColor; //color of the ray trail
  cttSegNum; //number of ray segments needed to span from bike center to bike tail

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

    //Some properties are only available once img has loaded.
    bikeElement.onload = () => {
      const imgSpec = bikeElement.getBoundingClientRect();
      this.objWidth = imgSpec.width;
      this.objHeight = imgSpec.height;

      //calculate how many trail segment immediately next to the bike  to ignore during bike collision
      //check. using (height+width)/2 accounts for the worst case the bike has just made a turn.
      //The plus one handles the boundary case when bike boundary touche the end of a ray segemnt
      this.cttSegNum =
        Math.floor((this.objHeight + this.objWidth) / 2 / this.speed) + 1;
      //rotate loaded image from the loaded up-right direction to its game-start direction then set boundaries
      this.rotate();
      this.boundaries = this.calculateBoundaryObstacles();
    };
  }

  //Summary: return a subset of a bike's trail (portion that is outside the bike image) that will
  //be used for collision check. The bike full trail starts from center of the bike.
  //Output: array of trail-type Obstacle objects
  getTrailForCollisionCheck() {
    //ignore trail created between bike center to bike tail for collision calculation purpose
    const trail =
      this.trail.length >= this.cttSegNum
        ? this.trail.slice(0, this.trail.length - this.cttSegNum)
        : [];
    return trail;
  }

  //Summary: move bike forward then add a trail-type Obstacle object that span between the previous
  //and current center position of the bike to the trail property of the bike.
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

  //Summary: find expired trail obstacles from bike's trail propery based on each obstacle's ttl value
  //Output: array of trail-type Obstacle objects
  findExpiredTrail() {
    const now = new Date().getTime();
    const segToRemove = [];
    while (this.trail[0].ttl < now) {
      const seg = this.trail.shift();
      segToRemove.push(seg);
    }
    return segToRemove;
  }

  //Summary: update bike's direction or projectile properties based on keyboard press event
  //Input: key press event
  updateBikeEvent(key) {
    switch (key.toLowerCase()) {
      //bike turning left
      case this.kbControl[0].toLowerCase():
        this.direction = this.getNewDirection(-1);
        this.rotate();
        break;
      //bike turning right
      case this.kbControl[1].toLowerCase():
        this.direction = this.getNewDirection(1);
        this.rotate();
        break;
      //emitting a projectile
      case this.kbControl[2].toLowerCase():
        if (this.projectileLeft > 0) {
          this.emitProjectile(this);
          this.projectileLeft--;
        }
        break;
    }
  }

  //Summary: update bike's moving direction
  //Input: a +1 or -1, used to calculate new direction using the DIR_ARRAY contant
  //Output: updated direction of bike
  getNewDirection(change) {
    const dirIndex = this.DIR_ARRAY.indexOf(this.direction);
    if (dirIndex == 0 && change == -1) {
      //handles the edge case not covered by modulus
      return this.DIR_ARRAY[3];
    } else {
      //use modulus to calculate new direction
      return this.DIR_ARRAY[(dirIndex + change) % 4];
    }
  }
}
