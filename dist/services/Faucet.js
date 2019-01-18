"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _web = require("../web3");

var _Users = _interopRequireDefault(require("./Users"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Faucet {
  static init({
    ethNetwork,
    swarmHost
  } = {
    ethNetwork: undefined,
    swarmHost: undefined
  }) {
    const faucet = new Faucet(); // Initiate EthResolver

    if (ethNetwork === undefined) {
      faucet.eth = _web.EthResolver.init();
    } else {
      faucet.eth = _web.EthResolver.init(ethNetwork);
    } // Initiate Swarm connector


    if (swarmHost === undefined) {
      faucet.bzz = _web.Swarm.init();
    } else {
      faucet.bzz = _web.Swarm.init(swarmHost);
    }

    return faucet;
  }

  async limit() {
    try {
      return await this.eth.faucet.limit();
    } catch (err) {
      throw Error(err);
    }
  }

  async setLimit(limit, wallet) {
    try {
      return await this.eth.faucet.setLimit(limit, wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async faucet(wallet) {
    try {
      return await this.eth.faucet.faucet(wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async received(wallet) {
    try {
      return await this.eth.faucet.received(wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async all() {
    try {
      let faucets = await this.eth.faucet.allFaucets();

      const users = _Users.default.init();

      let faucetters = await Promise.all(faucets.map(f => users.get(f.user)));
      return faucets.map((f, i) => f.user = faucetters[i]);
    } catch (err) {
      throw Error(err);
    }
  }

}

exports.default = Faucet;