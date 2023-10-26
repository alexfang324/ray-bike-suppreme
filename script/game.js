'use strict';
import Obstacle from './obstacle.js';
import { ObstacleType } from './enum.js';

export default class Game {
  SEGLENGTH = 1; //intrinsic segment length of the game
  RAYWIDTH = 3;
  BIKESPEED = 3;
  ARENA_WIDTH = 950; //pixel width of gameplay arena
  ARENA_HEIGHT = 500; //pixel height of gameplay arena
  ARENA_CEN_POS; //[x,y] position that's calculated at runtime
  ARENA_GRID_X_NUM = 15; //number of background grid lines horizontally
  ARENA_GRID_Y_NUM = 8; //number of background grid lines horizontally
  GAME_START_TIME = Date.now();

  players = [];
  arena; // arena html element
  obstacles = []; //list of obstacles in the arena (not including bike trails)
  trailCanvases = []; //canvas html elements

  constructor() {
    if (new.target === Game) {
      throw new TypeError('Cannot construct Game instances directly');
    }
  }

  setupArena = () => {
    const rootElement = document.getElementById('game-page');
    this.arena = document.createElement('div');
    this.arena.id = 'arena';
    this.arena.style.width = this.ARENA_WIDTH + 'px';
    this.arena.style.height = this.ARENA_HEIGHT + 'px';
    this.arena.style.backgroundSize = `${
      this.ARENA_WIDTH / this.ARENA_GRID_X_NUM
    }px ${this.ARENA_HEIGHT / this.ARENA_GRID_Y_NUM}px`;
    rootElement.appendChild(this.arena);
    this.ARENA_CEN_POS = [this.ARENA_WIDTH / 2.0, this.ARENA_HEIGHT / 2.0];

    //add arena boundaries as obstacles using relative position of the area
    this.obstacles.push(
      new Obstacle(0, this.ARENA_HEIGHT, 0, 0, ObstacleType.wall)
    );
    this.obstacles.push(
      new Obstacle(0, 0, this.ARENA_WIDTH, 0, ObstacleType.wall)
    );
    this.obstacles.push(
      new Obstacle(
        this.ARENA_WIDTH,
        0,
        this.ARENA_WIDTH,
        this.ARENA_HEIGHT,
        ObstacleType.wall
      )
    );
    this.obstacles.push(
      new Obstacle(
        0,
        this.ARENA_HEIGHT,
        this.ARENA_WIDTH,
        this.ARENA_HEIGHT,
        ObstacleType.wall
      )
    );
  };

  setupCanvases = () => {
    this.players.forEach((i) => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = this.ARENA_WIDTH;
      canvasElement.height = this.ARENA_HEIGHT;
      document.getElementById('arena').appendChild(canvasElement);
      this.trailCanvases.push(canvasElement);
    });
  };

  setupBikeEventListeners = () => {
    window.addEventListener('keydown', this.updateBikeEvent);
  };

  removeBikeEventListeners = () => {
    window.removeEventListener('keydown', this.updateBikeEvent);
  };

  updateBikeEvent = (event) => {
    this.players.forEach((player) => player.bike.updateBikeEvent(event.key));
  };

  //always redraw drail from beginning to achieve the neon blur effect
  drawCanvasTrail = (i) => {
    const trailSegments = this.players[i].bike.trail;
    const canvas = this.trailCanvases[i];
    const ctx = canvas.getContext('2d');

    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = this.RAYWIDTH;
    ctx.shadowColor = this.players[i].bike.trailColor;
    ctx.beginPath();
    trailSegments.forEach((seg) => {
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
    });
    ctx.strokeStyle = this.players[i].bike.trailColor;
    ctx.lineWidth = this.RAYWIDTH;
    ctx.stroke();
  };

  eraseCanvasTrail = (segsToRemove, i) => {
    const canvas = this.trailCanvases[i];
    const ctx = canvas.getContext('2d');
    for (const seg of segsToRemove) {
      const left = Math.min(seg.x1, seg.x2) - 2 * this.RAYWIDTH;
      const top = Math.min(seg.y1, seg.y2) - 2 * this.RAYWIDTH;
      const width = Math.abs(seg.x1 - seg.x2) + 4 * this.RAYWIDTH;
      const height = Math.abs(seg.y1 - seg.y2) + 4 * this.RAYWIDTH;
      ctx.clearRect(left, top, width, height);
    }
  };
}
