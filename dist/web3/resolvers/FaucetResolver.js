"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.faucet = faucet;
exports.setLimit = setLimit;
exports.received = received;
exports.currentLimit = currentLimit;
exports.allFaucets = allFaucets;

var _TokenFaucet = _interopRequireDefault(require("../artifacts/TokenFaucet.json"));

var _utils = require("ethers/utils");

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//faucet setlimit received limit
async function faucet(wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer");
    const tokenFaucet = this.ContractProvider(_TokenFaucet.default, this.provider, wallet);
    let tx = await tokenFaucet.faucet();
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function setLimit(limit, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer");
    const tokenFaucet = this.ContractProvider(_TokenFaucet.default, this.provider, wallet);
    let tx = await tokenFaucet.setLimit((0, _utils.parseEther)(limit.toString()));
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function received(wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer");
    const tokenFaucet = this.ContractProvider(_TokenFaucet.default, this.provider);
    return await tokenFaucet.received(wallet.address);
  } catch (err) {
    throw new Error(err);
  }
}

async function currentLimit() {
  try {
    const tokenFaucet = this.ContractProvider(_TokenFaucet.default, this.provider);
    let limit = await tokenFaucet.faucetLimit();
    return parseFloat((0, _utils.formatEther)((0, _utils.bigNumberify)(limit))).toFixed(2);
  } catch (err) {
    throw new Error(err);
  }
}

async function allFaucets() {
  try {
    const tokenFaucet = this.ContractProvider(_TokenFaucet.default, this.provider);
    let faucetEvent = new Interface(_TokenFaucet.default.abi).events.logFaucet;
    let faucetTopics = [faucetEvent.topic];
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: faucetTopics
    });
    logs = logs.map(log => faucetEvent.decode(log.data, log.topics));
    return logs.map(l => ({
      user: l._user,
      amount: parseFloat((0, _utils.formatEther)((0, _utils.bigNumberify)(l._amount))).toFixed(2),
      date: (0, _moment.default)(l._date.toString(10) * 1000, "x")
    }));
  } catch (err) {
    throw new Error(err);
  }
}