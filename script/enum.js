//Enum that list out the allow moving directions of a MovableObject object
const Direction = Object.freeze({
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right'
});

//Enum that relates the moving direction of a MovableObject instance to the rotational angle needed
//from its image's up-right position to point in that direction.
const ImgRotationAngle = Object.freeze({
  up: '0deg',
  right: '90deg',
  down: '180deg',
  left: '270deg'
});

//Enum that list out the allowed obstacle type of an Obstacle instance.
const ObstacleType = Object.freeze({
  wall: 'wall',
  rock: 'rock',
  trail: 'trail',
  bike: 'bike',
  projectile: 'projectile'
});

export { Direction, ImgRotationAngle, ObstacleType };
