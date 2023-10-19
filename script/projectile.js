import MovingObject from './moving-object.js';

export default class Projectile extends MovingObject {
  constructor(imgPosition, direction, speed, imgSrc) {
    super(imgPosition, direction, speed, imgSrc);
    this.getElement().classList.add('projectile');
  }
}
