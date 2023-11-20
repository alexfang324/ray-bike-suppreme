'use strict';
//An obstacle is defined as a line segment. A 2D obstacle can be represented using four obstacles
//that correponds its four sides.
export default class Obstacle {
  constructor(
    position, //[x1,y1,x2,y2] of the line segment representing the obstacle
    type = null, //null or one of values from ObstacleType enum
    ownerId = null, //used to relate to owner. e.g. rock boundary to the rock html img element or trail segment to its bike
    ttl = null, //time to live in milliseconds
    element = null //html element of the obstacle
  ) {
    this.position = position;
    this.type = type;
    this.ownerId = ownerId;
    this.ttl = ttl;
    this.element = element;
  }
}
