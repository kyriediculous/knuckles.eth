"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onTokenTransfer = void 0;

var _utils = require("ethers/utils");

var _Token = _interopRequireDefault(require("../../../contracts/build/contracts/Token.json"));

var _Provider = _interopRequireDefault(require("../Provider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const onTokenTransfer = (to, callback) => {
  const provider = (0, _Provider.default)(process.env.CLIENT);
  let event = new _utils.Interface(_Token.default.abi).events.Transfer;
  let topics = [event.topic];
  if (to) topics.push((0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(userAddress), 32)));
  provider.on({
    topics: topics,
    address: _Token.default.networks[provider.network.chainId].address
  }, raw => {
    if (raw !== undefined) callback(event.decode(raw.data, raw.topics));
  });
};

exports.onTokenTransfer = onTokenTransfer;