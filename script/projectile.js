import { ObstacleType } from './enum.js';
import MovableObject from './movable-object.js';

export default class Projectile extends MovableObject {
  constructor(id, groupId, centerPosition, direction, speed, imgSrc) {
    //calling base class constructor to create the projectile and place it in DOM
    super(id, groupId, centerPosition, direction, speed, imgSrc);
    this.obsType = ObstacleType.projectile;

    //hide projectile on screen, align it with the bike before showing it to player
    const projElement = this.element;
    projElement.classList.add('projectile');
    projElement.style.visibility = 'hidden';

    //get img width and height when it has been loaded to DOM
    projElement.onload = () => {
      const imgSpec = projElement.getBoundingClientRect();
      this.objWidth = imgSpec.width;
      this.objHeight = imgSpec.height;

      //align projectile's center based on bike's center position then show it to the player
      this.alignProjectile(centerPosition);
      projElement.style.visibility = 'visible';
    };
  }

  //Summary: align center of projectile image element to that of the emitter img element.
  alignProjectile(centerPosition) {
    //calculate new top left img position based on emitter's center position
    this.objPosition = [
      centerPosition[0] - this.objWidth / 2.0,
      centerPosition[1] - this.objHeight / 2.0
    ];

    //update new position to the img element
    this.element.style.left = this.objPosition[0] + 'px';
    this.element.style.top = this.objPosition[1] + 'px';

    //align projectile along direction of bike motion
    this.rotate();
    //create array of boundries for this projectile
    this.boundaries = this.calculateBoundaryObstacles();
  }
}
