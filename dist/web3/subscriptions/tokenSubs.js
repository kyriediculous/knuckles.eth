"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onTokenTransfer = void 0;

var _ethers = require("ethers");

var _Token = _interopRequireDefault(require("../artifacts/Token.json"));

var _Provider = _interopRequireDefault(require("../Provider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const onTokenTransfer = (provider, callback) => {
  let event = new _ethers.Interface(_Token.default.abi).events.Transfer;
  provider.on({
    topics: [event.topics[0]],
    address: _Token.default.networks[provider.chainId].address
  }, raw => {
    callback(event.parse(raw.topics, raw.data));
  });
};

exports.onTokenTransfer = onTokenTransfer;