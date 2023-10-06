import Bike from './bike.js';
import Direction from './direction_enum.js';

export default class Game {
  _SEGLENGTH = 1; //intrinsic segment length of the game
  _RAYWIDTH = 3;
  _BIKESPEED = 5;
  _ARENA_WIDTH = 900; //pixel width of gameplay arena
  _ARENA_HEIGHT = 500; //pixel height of gameplay arena
  _ARENA_CEN_POS;

  _arena; // arena html element
  _obsSegments = []; //list of segments representing obstacles in the arena (not including bike trails)
  _walls = []; //list of segments that represents boundary of the game
  _bikes = []; //list of bike objects
  _trailCanvases = []; //canvas html elements

  constructor() {
    if (new.target === Game) {
      throw new TypeError('Cannot construct Game instances directly');
    }
  }

  setupArena = () => {
    const rootElement = document.getElementById('game-page');
    this._arena = document.createElement('div');
    this._arena.id = 'arena';
    this._arena.style.width = this._ARENA_WIDTH + 'px';
    this._arena.style.height = this._ARENA_HEIGHT + 'px';
    rootElement.replaceChildren(this._arena);
    this._ARENA_CEN_POS = [this._ARENA_WIDTH / 2.0, this._ARENA_HEIGHT / 2.0];

    //add arena boundaries as obstacles using relative position of the area
    this._obsSegments.push([0, this._ARENA_HEIGHT, 0, 0]);
    this._obsSegments.push([0, 0, this._ARENA_WIDTH, 0]);
    this._obsSegments.push([
      this._ARENA_WIDTH,
      0,
      this._ARENA_WIDTH,
      this._ARENA_HEIGHT
    ]);
    this._obsSegments.push([
      0,
      this._ARENA_HEIGHT,
      this._ARENA_WIDTH,
      this._ARENA_HEIGHT
    ]);
  };

  setupCanvases = () => {
    this._bikes.forEach((i) => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = this._ARENA_WIDTH;
      canvasElement.height = this._ARENA_HEIGHT;
      document.getElementById('arena').appendChild(canvasElement);
      this._trailCanvases.push(canvasElement);
    });
  };

  evolveGame = () => {
    const gameInterval = setInterval(() => {
      this._bikes.forEach((bike, i) => {
        bike.moveForward();
        this.drawTrail(i);
      });

      //add current bike trail to list of obstacle segments
      let updatedObsSegs = [...this._obsSegments];
      this._bikes.forEach((bike) => {
        updatedObsSegs = [...updatedObsSegs, ...bike.getTrail()];
      });

      //check for collision
      for (const seg of updatedObsSegs) {
        const hasCollided = this._bikes.map((bike) => bike.hasCollided(seg));
        if (hasCollided.includes(true)) {
          clearInterval(gameInterval);
          window.removeEventListener('keydown', this.updateBikeDirection);
        }
      }
    }, 30);
  };

  setupEventListeners = () => {
    window.addEventListener('keydown', this.updateBikeDirection);
  };

  updateBikeDirection = (event) => {
    this._bikes.forEach((bike) => bike.updateDirection(event.key));
  };

  drawTrail = (i) => {
    const trailSegments = this._bikes[i].getTrail();
    const canvas = this._trailCanvases[i];
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = this._RAYWIDTH;
    ctx.shadowColor = this._bikes[i].getTrailColor();
    ctx.beginPath();
    trailSegments.forEach((seg) => {
      ctx.moveTo(seg[0], seg[1]);
      ctx.lineTo(seg[2], seg[3]);
    });
    ctx.strokeStyle = this._bikes[i].getTrailColor();
    ctx.lineWidth = this._RAYWIDTH;
    ctx.stroke();
  };
}
