//An obstacle is defined as a line segment. A 2D obstacle can be represented using four obstacles
//that correponds its four sides.
export default class Obstacle {
  constructor(
    x1,
    y1,
    x2,
    y2,
    type = null,
    id = null,
    ttl = null,
    element = null
  ) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.ttl = ttl;
    this.type = type;
    this.id = id;
    this.element = element;
  }
}
