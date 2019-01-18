"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onBountyCreated = void 0;

var _ethers = require("ethers");

var _BountyFactory = _interopRequireDefault(require("../artifacts/BountyFactory.json"));

var _Provider = _interopRequireDefault(require("../Provider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const onBountyCreated = (provider, callback) => {
  let event = new _ethers.Interface(_BountyFactory.default.abi).events.logBountyCreated;
  provider.on({
    topics: [event.topics[0]]
  }, raw => {
    callback(raw.map(log => event.parse(log.topics, log.data)));
  });
};

exports.onBountyCreated = onBountyCreated;