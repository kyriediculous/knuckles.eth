"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onBountyCommit = exports.onBountyAccepted = exports.onBountyCreated = void 0;

var _utils = require("ethers/utils");

var _BountyFactory = _interopRequireDefault(require("../artifacts/BountyFactory.json"));

var _RecurringBountyFactory = _interopRequireDefault(require("../artifacts/RecurringBountyFactory.json"));

var _BountyInterface = _interopRequireDefault(require("../artifacts/BountyInterface.json"));

var _RecurringBountyInterface = _interopRequireDefault(require("../artifacts/RecurringBountyInterface.json"));

var _Provider = _interopRequireDefault(require("../Provider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const onBountyCreated = callback => {
  const provider = (0, _Provider.default)(process.env.CLIENT);
  let event = new _utils.Interface(_BountyFactory.default.abi).events.logBountyCreated;
  let recurringEvent = new _utils.Interface(_RecurringBountyFactory.default.abi).events.logRecurringBountyCreated;
  provider.on({
    topics: [event.topic]
  }, raw => {
    callback(event.decode(raw.data, raw.topics));
  });
  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    callback(recurringEvent.decode(raw.data, raw.topics));
  });
};

exports.onBountyCreated = onBountyCreated;

const onBountyAccepted = callback => {
  const provider = (0, _Provider.default)(process.env.CLIENT);
  let event = new _utils.Interface(_BountyInterface.default.abi).events.logAccepted;
  let recurringEvent = new _utils.Interface(_RecurringBountyInterface.default.abi).events.logRecurringAccepted;
  provider.on({
    topics: [event.topic]
  }, raw => {
    callback(event.decode(raw.data, raw.topics));
  });
  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    callback(recurringEvent.decode(raw.data, raw.topics));
  });
};

exports.onBountyAccepted = onBountyAccepted;

const onBountyCommit = callback => {
  const provider = (0, _Provider.default)(process.env.CLIENT);
  let event = new _utils.Interface(_BountyInterface.default.abi).events.logCommit;
  let recurringEvent = new _utils.Interface(_RecurringBountyInterface.default.abi).events.logRecurringCommit;
  provider.on({
    topics: [event.topic]
  }, raw => {
    callback(event.decode(raw.data, raw.topics));
  });
  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    callback(recurringEvent.decode(raw.data, raw.topics));
  });
};

exports.onBountyCommit = onBountyCommit;