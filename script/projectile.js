import MovableObject from './movable-object.js';

export default class Projectile extends MovableObject {
  constructor(centerPosition, direction, speed, imgSrc) {
    super(centerPosition, direction, speed, imgSrc);
    const projElement = this.element;
    projElement.classList.add('projectile');
    //set image visibility to hidden since we haven't properly aligned the projectile relative to emitter
    projElement.style.visibility = 'hidden';

    projElement.onload = () => {
      const imgSpec = projElement.getBoundingClientRect();
      this.objWidth = imgSpec.width;
      this.objHeight = imgSpec.height;
      this.calculateImgBoundaries();

      //align projectile's center based on bike's center position then show image
      this.alignProjectile(centerPosition);
      projElement.style.visibility = 'visible';
    };
  }

  //Summary: align img center of projectile to that of the emitter.
  alignProjectile(centerPosition) {
    //update top left img position based on emitter's center position
    this.objPosition = [
      centerPosition[0] - this.objWidth / 2.0,
      centerPosition[1] - this.objHeight / 2.0
    ];

    //update it to the img element
    this.element.style.left = this.objPosition[0] + 'px';
    this.element.style.top = this.objPosition[1] + 'px';

    //align projectile along direction of bike motion
    this.rotate();
    this.boundaries = this.calculateImgBoundaries();
  }
}
