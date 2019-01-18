"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onTokenTransfer = void 0;

var _ethers = require("ethers");

var _Token = _interopRequireDefault(require("../artifacts/Token.json"));

var _Provider = _interopRequireDefault(require("../Provider"));

var _ContractProvider = _interopRequireDefault(require("../ContractProvider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const onTokenTransfer = (provider, callback) => {
  //let event = (new Interface(Token.abi)).events.Transfer
  let token = new _ethers.Contract(_Token.default.networks[provider.chainId].address, _Token.default.abi, provider); //let token2 = ContractProvider(Token, provider)

  provider.on({
    topics: [event.topics[0]],
    address: _Token.default.networks[provider.chainId].address
  }, raw => {
    callback(raw.map(log => event.parse(log.topics, log.data)));
  });
};

exports.onTokenTransfer = onTokenTransfer;