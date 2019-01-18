"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _web = require("../web3");

class Token {
  static init({
    ethNetwork,
    swarmHost
  } = {
    ethNetwork: undefined,
    swarmHost: undefined
  }) {
    const token = new Token();

    if (ethNetwork === undefined) {
      token.eth = _web.EthResolver.init();
    } else {
      token.eth = _web.EthResolver.init(ethNetwork);
    }

    if (swarmHost === undefined) {
      token.bzz = _web.Swarm.init();
    } else {
      token.bzz = _web.Swarm.init(swarmHost);
    }

    return token;
  }

  async balance(address) {
    try {
      return await this.eth.token.getBalance(address);
    } catch (err) {
      throw new Error(err);
    }
  }

  async send(to, amount, wallet) {
    try {
      const tx = await this.eth.token.send(to, amount, wallet);
      return await wallet.provider.waitForTransaction(tx.hash);
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }

  async approve(to, amount, wallet) {
    try {
      const tx = await this.eth.token.approveSpend(to, amount, wallet);
      return await wallet.provider.waitForTransaction(tx.hash);
    } catch (err) {
      throw new Error(err);
    }
  }

  async allowance(approver, spender) {
    try {
      return await this.eth.token.getAllowance(approver, spender);
    } catch (err) {
      throw new Error(err);
    }
  }

  async info() {
    try {
      return await this.eth.token.tokenInfo();
    } catch (err) {
      throw new Error(err);
    }
  }

  address() {
    return this.eth.token.address();
  }

}

var _default = Token;
exports.default = _default;