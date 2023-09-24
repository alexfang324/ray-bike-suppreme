import Bike from './bike';
// const Bike = require('./bike')
import Direction from './direction_enum';

segLength = 1; //intrinsic segment length of the game

//Summary: define walls that represent the boundary of the game play area
//Input: l is number of segLength the zone spans horizontally
//       w is number of segLength the zone spans vertically
//Output: an array of wall segments each represented by an array of [x1, y1, x2, y2]
const createWalls = (l, w) => {
  walls = [];
  x = 0;
  y = 0;
  //construct bottom horizontal wall
  for (let i = 0; i < l; i++) {
    x2 = x + segLength;
    walls.push([x, y, x2, y]);
    x = x2;
  }
  //construct right vertical wall
  for (let i = 0; i < w; i++) {
    y2 = y + segLength;
    walls.push([x, y, x, y2]);
    y = y2;
  }
  //construct top horizontal wall
  for (let i = l - 1; i > -1; i--) {
    x1 = x - segLength;
    walls.push([x1, y, x, y]);
    x = x1;
  }
  //construct left vertical wall
  for (let i = w - 1; i > -1; i--) {
    y1 = y - segLength;
    walls.push([x, y1, x, y]);
    y = y1;
  }

  return walls;
};

const renderWalls = (walls) => {
  const targetElement = document.getElementById('root');
  const wallElements = (
    <div>
      {walls.map((wall) => {
        const styling = 'left:' + wall[0] + 'px; top:' + wall[1] + 'px;';
        return <img src="./img/wall.jpg" width="200" style={styling} />;
      })}
    </div>
  );
  console.log(wallElements);
  targetElement = wallElements;
};

const main = () => {
  console.log('hello');
  // walls = createWalls(10, 8);
  // renderWalls(walls);
  // bike = Bike([5, 4], Direction.right, 1);
};

main();
