'use strict';
import Obstacle from './obstacle.js';

export default class Game {
  _SEGLENGTH = 1; //intrinsic segment length of the game
  _RAYWIDTH = 3;
  _BIKESPEED = 3;
  _ARENA_WIDTH = 950; //pixel width of gameplay arena
  _ARENA_HEIGHT = 500; //pixel height of gameplay arena
  _ARENA_CEN_POS; //[x,y] position that's calculated at runtime
  _ARENA_GRID_X_NUM = 15; //number of background grid lines horizontally
  _ARENA_GRID_Y_NUM = 8; //number of background grid lines horizontally
  _GAME_START_TIME = Date.now();

  _players = [];
  _arena; // arena html element
  _obstacles = []; //list of obstacles in the arena (not including bike trails)
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
    this._arena.style.backgroundSize = `${
      this._ARENA_WIDTH / this._ARENA_GRID_X_NUM
    }px ${this._ARENA_HEIGHT / this._ARENA_GRID_Y_NUM}px`;
    rootElement.appendChild(this._arena);
    this._ARENA_CEN_POS = [this._ARENA_WIDTH / 2.0, this._ARENA_HEIGHT / 2.0];

    //add arena boundaries as obstacles using relative position of the area
    this._obstacles.push(new Obstacle(0, this._ARENA_HEIGHT, 0, 0));
    this._obstacles.push(new Obstacle(0, 0, this._ARENA_WIDTH, 0));
    this._obstacles.push(
      new Obstacle(this._ARENA_WIDTH, 0, this._ARENA_WIDTH, this._ARENA_HEIGHT)
    );
    this._obstacles.push(
      new Obstacle(0, this._ARENA_HEIGHT, this._ARENA_WIDTH, this._ARENA_HEIGHT)
    );
  };

  setupCanvases = () => {
    this._players.forEach((i) => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = this._ARENA_WIDTH;
      canvasElement.height = this._ARENA_HEIGHT;
      document.getElementById('arena').appendChild(canvasElement);
      this._trailCanvases.push(canvasElement);
    });
  };

  setupBikeEventListeners = () => {
    window.addEventListener('keydown', this.updateBikeDirection);
  };

  removeBikeEventListeners = () => {
    window.removeEventListener('keydown', this.updateBikeDirection);
  };

  updateBikeDirection = (event) => {
    this._players.forEach((player) =>
      player.getBike().updateDirection(event.key)
    );
  };

  drawTrail = (i) => {
    const trailSegments = this._players[i].getBike().getTrail();
    const canvas = this._trailCanvases[i];
    const ctx = canvas.getContext('2d');

    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = this._RAYWIDTH;
    ctx.shadowColor = this._players[i].getBike().getTrailColor();
    ctx.beginPath();
    trailSegments.forEach((seg) => {
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
    });
    ctx.strokeStyle = this._players[i].getBike().getTrailColor();
    ctx.lineWidth = this._RAYWIDTH;
    ctx.stroke();
  };

  eraseTrail = (segsToRemove, i) => {
    const canvas = this._trailCanvases[i];
    const ctx = canvas.getContext('2d');
    for (const seg of segsToRemove) {
      const left = Math.min(seg.x1, seg.x2) - 2 * this._RAYWIDTH;
      const top = Math.min(seg.y1, seg.y2) - 2 * this._RAYWIDTH;
      const width = Math.abs(seg.x1 - seg.x2) + 4 * this._RAYWIDTH;
      const height = Math.abs(seg.y1 - seg.y2) + 4 * this._RAYWIDTH;
      ctx.clearRect(left, top, width, height);
    }
  };
}
