"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBalance = getBalance;
exports.sendTokens = sendTokens;
exports.approveSpend = approveSpend;
exports.getAllowance = getAllowance;
exports.tokenInfo = tokenInfo;
exports.address = address;

var _Token = _interopRequireDefault(require("../artifacts/Token.json"));

var _utils = require("ethers/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function getBalance(address) {
  try {
    const token = this.ContractProvider(_Token.default, this.provider);
    let balance = await token.balanceOf(address);
    return (0, _utils.formatEther)(balance);
  } catch (err) {
    throw new Error('Unable to retrieve token balance' + err);
  }
}

async function sendTokens(recipient, amount, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const token = this.ContractProvider(_Token.default, wallet);

    if (typeof amount != 'string') {
      amount = amount.toString();
    }

    amount = (0, _utils.parseEther)(amount);
    let tx = await token.transfer(recipient, amount, {
      gasPrice: '0x0'
    });
    return await this.provider.waitForTransaction(tx.hash);
  } catch (err) {
    throw new Error(err);
  }
}

async function approveSpend(recipient, amount, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const token = this.ContractProvider(_Token.default, wallet);

    if (typeof amount != 'string') {
      amount = amount.toString();
    }

    amount = (0, _utils.parseEther)(amount);
    let tx = await token.approve(recipient, amount, {
      gasPrice: '0x0'
    });
    return await this.provider.waitForTransaction(tx.hash);
  } catch (err) {
    throw new Error(err);
  }
}

async function getAllowance(approver, spender) {
  try {
    const token = this.ContractProvider(_Token.default, this.provider);
    let balance = await token.allowance(approver, spender);
    return (0, _utils.formatEther)(balance);
  } catch (err) {
    throw new Error('Unable to retrieve token allowance', err);
  }
}

async function tokenInfo() {
  try {
    const token = this.ContractProvider(_Token.default, this.provider);
    const supply = await token.totalSupply();
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    return {
      name,
      symbol,
      supply,
      decimals
    };
  } catch (err) {
    throw new Error('Error retrieving token details', err);
  }
}

function address() {
  const token = this.ContractProvider(_Token.default, this.provider);
  return token.address;
}