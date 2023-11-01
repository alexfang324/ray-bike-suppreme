//An obstacle is defined as a line segment. A 2D obstacle can be represented using four obstacles
//that correponds its four sides.
export default class Obstacle {
  constructor(
    x1, //pixel distance from the top left of the arena html element
    y1,
    x2,
    y2,
    type = null,
    ownerId = null, //used to relate to owner. e.g. 4 sides of a rock would all have the same
    //html tag id of the rock element and all trails segs will have the id of the bike element
    ttl = null, //time to live in milliseconds
    element = null //html element of the obstacle
  ) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.ttl = ttl;
    this.type = type;
    this.ownerId = ownerId;
    this.element = element;
  }
}
