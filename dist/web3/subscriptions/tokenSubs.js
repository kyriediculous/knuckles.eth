"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onTokenTransfer = onTokenTransfer;

var _ethers = require("ethers");

var _Token = _interopRequireDefault(require("../artifacts/Token.json"));

var _Provider = _interopRequireDefault(require("../Provider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function onTokenTransfer(provider, callback) {
  let event = new _ethers.Interface(_Token.default.abi).events.Transfer;
  provider.on({
    topics: [event.topics[0]],
    address: _Token.default.networks[provider.chainId].address
  }, raw => {
    callback(raw.map(log => event.parse(log.topics, log.data)));
  });
}