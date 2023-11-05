'use strict';
import Obstacle from './obstacle.js';
import { ObstacleType } from './enum.js';

export default class Game {
  RAYWIDTH = 3; //pixel width of trail
  BIKESPEED = 3; //pixel distance moved per game interation
  ARENA_WIDTH = 900; //pixel width of gameplay arena
  ARENA_HEIGHT = 450; //pixel height of gameplay arena
  ARENA_CEN_POS; //[x,y] position that's calculated at runtime
  ARENA_GRID_X_NUM = 15; //number of background grid lines horizontally
  ARENA_GRID_Y_NUM = 8; //number of background grid lines horizontally
  GAME_START_TIME = Date.now();
  GAME_REFRESH_RATE = 30; //ms refresh rate, up to screen refresh rate

  arena; // arena html element
  trailCanvasElement; //canvas html elements
  players = [];
  obstacles = []; //list of obstacles in the arena (not including bike trails)

  constructor() {
    if (new.target === Game) {
      throw new TypeError('Cannot construct Game instances directly');
    }
  }

  setupArena() {
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
      new Obstacle([0, this.ARENA_HEIGHT, 0, 0], ObstacleType.wall)
    );
    this.obstacles.push(
      new Obstacle([0, 0, this.ARENA_WIDTH, 0], ObstacleType.wall)
    );
    this.obstacles.push(
      new Obstacle([
        this.ARENA_WIDTH,
        0,
        this.ARENA_WIDTH,
        this.ARENA_HEIGHT],
        ObstacleType.wall
      )
    );
    this.obstacles.push(
      new Obstacle([
        0,
        this.ARENA_HEIGHT,
        this.ARENA_WIDTH,
        this.ARENA_HEIGHT],
        ObstacleType.wall
      )
    );
  }

  setupCanvases() {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = this.ARENA_WIDTH;
    canvasElement.height = this.ARENA_HEIGHT;
    document.getElementById('arena').appendChild(canvasElement);
    this.trailCanvasElement = canvasElement;
  }

  setupBikeEventListeners() {
    window.addEventListener('keydown', this.updateBikeEvent);
  }

  removeBikeEventListeners() {
    window.removeEventListener('keydown', this.updateBikeEvent);
  }

  updateBikeEvent = (event) => {
    this.players.forEach((player) => player.bike.updateBikeEvent(event.key));
  };

  //always redraw drail from beginning to achieve the neon blur effect
  drawCanvasTrail() {
    const ctx = this.trailCanvasElement.getContext('2d');
    this.players.forEach((player) => {
      const trailSegments = player.bike.trail;
      //set styles of trail
      ctx.strokeStyle = player.bike.trailColor;
      ctx.lineWidth = this.RAYWIDTH;
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowBlur = this.RAYWIDTH;
      ctx.shadowColor = player.bike.trailColor;
      //define trail
      ctx.beginPath();
      trailSegments.forEach((seg) => {
        const pos = seg.position;
        ctx.moveTo(pos[0],pos[1]);
        ctx.lineTo(pos[2],pos[3]);
      });
      //draw trail
      ctx.stroke();

      //////////////////////////////////////////////////////////////////////////////
      // drawing box on bike boundaries
      ctx.strokeStyle = 'red';
      ctx.lineWidth = '2';
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      player.bike.boundaries.forEach((b) => {
        const pos = b.position;
        ctx.moveTo(pos[0],pos[1]);
        ctx.lineTo(pos[2],pos[3]);
      });
      ctx.stroke();
    });
  }

  eraseCanvasTrail(segsToRemove) {
    const ctx = this.trailCanvasElement.getContext('2d');
    for (const seg of segsToRemove) {
      const pos = seg.position;
      const left = Math.min(pos[0],pos[1]) - 2 * this.RAYWIDTH;
      const top = Math.min(pos[2],pos[3]) - 2 * this.RAYWIDTH;
      const width = Math.abs(pos[0],pos[1]) + 4 * this.RAYWIDTH;
      const height = Math.abs(pos[2],pos[3]) + 4 * this.RAYWIDTH;
      ctx.clearRect(left, top, width, height);
    }
  }
}
