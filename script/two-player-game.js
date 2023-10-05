import Game from './game.js';
import Bike from './bike.js';
import Direction from './direction_enum.js';

export default class TwoPlayerGame extends Game {
  constructor() {
    super();
    this.setupArena();
    this.createBikes();
    this.setupCanvases();
    this.setupEventListeners();
    this.evolveGame();
  }

  createBikes = () => {
    const bike1 = new Bike(
      [this.ARENA_CEN_POS[0] + 200, this.ARENA_CEN_POS[1]],
      Direction.left,
      this.BIKESPEED,
      'Alex',
      '../img/green-bike.jpg',
      'rgb(57, 255, 20)',
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    );
    this.bikes.push(bike1);

    const bike2 = new Bike(
      [this.ARENA_CEN_POS[0] - 200, this.ARENA_CEN_POS[1]],
      Direction.right,
      this.BIKESPEED,
      'Josh',
      '../img/shopping-cart.jpg',
      'rgb(188, 19, 254)',
      ['w', 's', 'a', 'd']
    );
    this.bikes.push(bike2);
  };
}
