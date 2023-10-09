import Bike from './bike.js';
import Direction from './direction_enum.js';

export default class Game {
  _SEGLENGTH = 1; //intrinsic segment length of the game
  _RAYWIDTH = 3;
  _BIKESPEED = 5;
  _ARENA_WIDTH = 900; //pixel width of gameplay arena
  _ARENA_HEIGHT = 500; //pixel height of gameplay arena
  _ARENA_CEN_POS;
  _GAME_START_TIME = Date.now();

  _playerName1;
  _playerName2;
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

  setupScoreBoard = () => {
    const rootElement = document.getElementById('game-page');
    const scoreBoardElement = document.createElement('div');
    scoreBoardElement.classList.add('score-board');
    scoreBoardElement.innerHTML =
      '<p class="player-label">Player 1</p><p id="player-score">0</p><p class="player-label">Player 2</p>';
    rootElement.appendChild(scoreBoardElement);
  };

  setupArena = () => {
    const rootElement = document.getElementById('game-page');
    this._arena = document.createElement('div');
    this._arena.id = 'arena';
    this._arena.style.width = this._ARENA_WIDTH + 'px';
    this._arena.style.height = this._ARENA_HEIGHT + 'px';
    rootElement.appendChild(this._arena);
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
