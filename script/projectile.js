import MovingObject from './moving-object.js';
import { ImgRotationAngle } from './enum.js';

export default class Projectile extends MovingObject {
  constructor(centerPosition, direction, speed, imgSrc) {
    super(centerPosition, direction, speed, imgSrc);
    const projElement = this.getElement();
    projElement.classList.add('projectile');

    projElement.onload = () => {
      this._imgWidth = parseFloat(
        projElement.getBoundingClientRect().width.toFixed(4)
      );
      this._imgHeight = parseFloat(
        projElement.getBoundingClientRect().height.toFixed(4)
      );
      //when the image is placed on screen, it won't be centered with the emitter because
      //projectile doesn't have the same img dimension as the emitter so we've to realign
      //it after it's been created in DOM
      this._alignProjectile(centerPosition);

      projElement.style.rotate = ImgRotationAngle[direction];
    };
  }

  //Summary: align img center of projectile to that of the emitter.
  _alignProjectile = (centerPosition) => {
    //update top left img position based on emitter's center position
    this._imgPosition = [
      centerPosition[0] - this._imgWidth / 2.0,
      centerPosition[1] - this._imgHeight / 2.0
    ];

    //update it to the img element
    this.getElement().style.left = this._imgPosition[0] + 'px';
    this.getElement().style.top = this._imgPosition[1] + 'px';
  };

  //
}
