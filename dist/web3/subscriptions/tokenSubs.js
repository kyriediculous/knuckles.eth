"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onTokenTransfer = void 0;

var _utils = require("ethers/utils");

var _Token = _interopRequireDefault(require("../artifacts/Token.json"));

var _Provider = _interopRequireDefault(require("../Provider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const onTokenTransfer = (provider, callback) => {
  let event = new _utils.Interface(_Token.default.abi).events.Transfer;
  provider.on({
    topics: [event.topic],
    address: _Token.default.networks[provider.network.chainId].address
  }, raw => {
    callback(event.decode(raw.data, raw.topics));
  });
};

exports.onTokenTransfer = onTokenTransfer;