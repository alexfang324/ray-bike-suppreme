'use strict';

export default class Player {
  _name;
  _bike;
  _accumulatedScore;
  _bestScore;

  constructor(name) {
    this._name = name;
    this._accumulatedScore = 0;
    this._bestScore = 0;
  }

  getName = () => {
    return this._name;
  };

  getBike = () => {
    return this._bike;
  };

  setBike = (bike) => {
    this._bike = bike;
  };

  getAccumulatedScore = () => {
    return this._accumulatedScore;
  };

  getBestScore = () => {
    return this._bestScore;
  };

  updateScore = (newScore) => {
    this._accumulatedScore += newScore;
    this._bestScore = Math.max(newScore, this._bestScore);
  };
}
