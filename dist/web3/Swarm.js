"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _swarm = require("@erebos/swarm");

const request = require('request');

const toUtf8String = require('ethers/utils').toUtf8String;

const clients = {
  development: 'http://localhost:8500',
  knuckles: 'https://knuckle-swarm.designisdead.com'
};

class Swarm {
  static init(host = clients[process.env.CLIENT]) {
    const swarm = new Swarm();
    swarm.bzz = new _swarm.SwarmClient({
      bzz: host
    }).bzz;
    swarm.host = host;
    return swarm;
  }

  async upload(file, options) {
    return this.bzz.upload(file, options);
  }

  async download(hash) {
    const res = await this.bzz.download(hash);
    return res;
  }

}

var _default = Swarm;
exports.default = _default;