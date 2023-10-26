'use strict';

export default class Player {
  name;
  bike;
  accumulatedScore;
  bestScore;

  constructor(name) {
    this.name = name;
    this.accumulatedScore = 0;
    this.bestScore = 0;
  }

  updateScore = (newScore) => {
    this.accumulatedScore += newScore;
    this.bestScore = Math.max(newScore, this.bestScore);
  };
}
