//enum for allowed moving directions
const Direction = Object.freeze({
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right'
});

//enum relating bike pointing direction and image rotation angled needed
const ImgRotationAngle = Object.freeze({
  up: '0deg',
  right: '90deg',
  down: '180deg',
  left: '270deg'
});

const ObstacleType = Object.freeze({
  wall: 'wall',
  rock: 'rock',
  trail: 'trail'
});

export { Direction, ImgRotationAngle, ObstacleType };
