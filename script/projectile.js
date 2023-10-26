import MovableObject from './movable-object.js';
import { ImgRotationAngle } from './enum.js';

export default class Projectile extends MovableObject {
  constructor(centerPosition, direction, speed, imgSrc) {
    super(centerPosition, direction, speed, imgSrc);
    const projElement = this.element;
    projElement.classList.add('projectile');

    projElement.onload = () => {
      this.imgWidth = parseFloat(
        projElement.getBoundingClientRect().width.toFixed(4)
      );
      this.imgHeight = parseFloat(
        projElement.getBoundingClientRect().height.toFixed(4)
      );
      //when the image is placed on screen, it won't be centered with the emitter because
      //projectile doesn't have the same img dimension as the emitter so we've to realign
      //it after it's been created in DOM
      this.alignProjectile(centerPosition);

      projElement.style.rotate = ImgRotationAngle[direction];
    };
  }

  //Summary: align img center of projectile to that of the emitter.
  alignProjectile = (centerPosition) => {
    //update top left img position based on emitter's center position
    this.imgPosition = [
      centerPosition[0] - this.imgWidth / 2.0,
      centerPosition[1] - this.imgHeight / 2.0
    ];

    //update it to the img element
    this.element.style.left = this.imgPosition[0] + 'px';
    this.element.style.top = this.imgPosition[1] + 'px';
  };

  //
}
