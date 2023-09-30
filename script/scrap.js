//Summary: define walls that represent the boundary of the game play area
//Input: l is number of segLength the zone spans horizontally
//       w is number of segLength the zone spans vertically
//Output: an array of wall segments each represented by an array of [x1, y1, x2, y2]
const createWalls = (l, w) => {
  let walls = [];
  let x = 0;
  let y = 0;
  //construct bottom horizontal wall
  for (let i = 0; i < l; i++) {
    const x2 = x + segLength;
    walls.push([x, y, x2, y]);
    x = x2;
  }
  //construct right vertical wall
  for (let i = 0; i < w; i++) {
    const y2 = y + segLength;
    walls.push([x, y, x, y2]);
    y = y2;
  }
  //construct top horizontal wall
  for (let i = l - 1; i > -1; i--) {
    const x1 = x - segLength;
    walls.push([x1, y, x, y]);
    x = x1;
  }
  //construct left vertical wall
  for (let i = w - 1; i > -1; i--) {
    const y1 = y - segLength;
    walls.push([x, y1, x, y]);
    y = y1;
  }

  return walls;
};

const renderWalls = (walls) => {
  const targetElement = document.getElementById('root');
  const wallElements = document.createElement('div');
  wallElements.className = 'game-boundary';
  walls.forEach((wall) => {
    const wallElement = document.createElement('img');
    wallElement.src = './img/wall.jpg';
    wallElement.style =
      'position: absolute;left:' +
      wall[0] * 160 +
      'px;top:' +
      wall[1] * 160 +
      'px;width:160px;';
    wallElements.appendChild(wallElement);
  });
  console.log(wallElements);
  targetElement.replaceWith(wallElements);
};

// script for creaing dot
//BEGINNING#####################################################
const dotElement = document.createElement('img');
const bikeElement = document.getElementById('Alex');
dotElement.id = 'circle';
dotElement.style.top = bike1.getHeadPosition()[1]+'px';
dotElement.style.left = bike1.getHeadPosition()[0]+'px';
const arena = document.getElementById('arena');
arena.appendChild(dotElement);
//END###########################################################
