'use strict';

export default class Player {
  constructor(name, bike) {
    this._name = name;
    this._bike = bike;
    this._accumulatedScore = 0;
    this._bestScore = 0;
  }

  getName = () => {
    return this._name;
  };

  getBike = () => {
    return this._bike;
  };

  updateScore = (newScore) => {
    this._accumulatedScore += newScore;
    this._bestScore = Math.max(newScore, this._bestScore);
  };
}
