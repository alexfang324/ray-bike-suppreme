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

  //Summary: caclculate the accumulated and the best-so-far score
  updateScore(newScore) {
    this.accumulatedScore += newScore;
    this.bestScore = Math.max(newScore, this.bestScore);
  }
}
