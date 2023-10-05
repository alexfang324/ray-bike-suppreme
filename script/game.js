import Bike from './bike.js';
import Direction from './direction_enum.js';

export default class Game {
  constructor() {
    if (new.target === Game) {
      throw new TypeError('Cannot construct Game instances directly');
    }
  }

  SEGLENGTH = 1; //intrinsic segment length of the game
  RAYWIDTH = 3;
  BIKESPEED = 5;

  ARENA_WIDTH = 900; //pixel width of gameplay arena
  ARENA_HEIGHT = 500; //pixel height of gameplay arena
  ARENA_CEN_POS;

  obstacles = [];
  walls = [];
  bikes = []; //list of bike objects
  trailCanvases = []; //canvas html elements

  setupArena = () => {
    const rootElement = document.getElementById('game-page');
    const arena = document.createElement('div');
    arena.id = 'arena';
    arena.style.width = this.ARENA_WIDTH + 'px';
    arena.style.height = this.ARENA_HEIGHT + 'px';
    rootElement.replaceChildren(arena);
    this.ARENA_CEN_POS = [this.ARENA_WIDTH / 2.0, this.ARENA_HEIGHT / 2.0];

    //add arena boundaries as obstacles using relative position of the area
    this.walls.push([0, this.ARENA_HEIGHT, 0, 0]);
    this.walls.push([0, 0, this.ARENA_WIDTH, 0]);
    this.walls.push([this.ARENA_WIDTH, 0, this.ARENA_WIDTH, this.ARENA_HEIGHT]);
    this.walls.push([
      0,
      this.ARENA_HEIGHT,
      this.ARENA_WIDTH,
      this.ARENA_HEIGHT
    ]);
  };

  setupCanvases = () => {
    this.bikes.forEach((i) => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = this.ARENA_WIDTH;
      canvasElement.height = this.ARENA_HEIGHT;
      document.getElementById('arena').appendChild(canvasElement);
      this.trailCanvases.push(canvasElement);
    });
  };

  evolveGame = () => {
    const gameInterval = setInterval(() => {
      this.bikes.forEach((bike, i) => {
        bike.moveForward();
        this.drawTrail(i);
      });

      //construct a list of all obstacles in the game
      this.obstacles = [...this.walls];
      this.bikes.forEach((bike) => {
        this.obstacles = [...this.obstacles, ...bike.getTrail()];
      });
      //check for collision
      for (const obstacle of this.obstacles) {
        const hasCollided = this.bikes.map((bike) =>
          bike.hasCollided(obstacle)
        );
        if (hasCollided.includes(true)) {
          console.log('game over');
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
    this.bikes.forEach((bike) => bike.updateDirection(event.key));
  };

  drawTrail = (i) => {
    const trailSegments = this.bikes[i].getTrail();
    const canvas = this.trailCanvases[i];
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = this.RAYWIDTH;
    ctx.shadowColor = this.bikes[i].getTrailColor();
    ctx.beginPath();
    trailSegments.forEach((seg) => {
      ctx.moveTo(seg[0], seg[1]);
      ctx.lineTo(seg[2], seg[3]);
    });
    ctx.strokeStyle = this.bikes[i].getTrailColor();
    ctx.lineWidth = this.RAYWIDTH;
    ctx.stroke();
  };
}
