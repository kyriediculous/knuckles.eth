"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onBountyCommit = exports.onBountyAccepted = exports.onBountyCreated = void 0;

var _utils = require("ethers/utils");

var _BountyFactory = _interopRequireDefault(require("../../../contracts/build/contracts/BountyFactory.json"));

var _RecurringBountyFactory = _interopRequireDefault(require("../../../contracts/build/contracts/RecurringBountyFactory.json"));

var _BountyInterface = _interopRequireDefault(require("../../../contracts/build/contracts/BountyInterface.json"));

var _RecurringBountyInterface = _interopRequireDefault(require("../../../contracts/build/contracts/RecurringBountyInterface.json"));

var _Provider = _interopRequireDefault(require("../Provider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const onBountyCreated = callback => {
  const provider = (0, _Provider.default)(process.env.CLIENT);
  let event = new _utils.Interface(_BountyFactory.default.abi).events.logBountyCreated;
  let recurringEvent = new _utils.Interface(_RecurringBountyFactory.default.abi).events.logRecurringBountyCreated;
  provider.on({
    topics: [event.topic]
  }, raw => {
    let decoded = { ...event.decode(raw.data, raw.topics),
      type: 'single'
    };
    callback(decoded);
  });
  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    let decoded = { ...recurringEvent.decode(raw.data, raw.topics),
      type: 'recurring'
    };
    callback(decoded);
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
    let decoded = { ...event.decode(raw.data, raw.topics),
      type: 'single'
    };
    callback(decoded);
  });
  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    let decoded = { ...recurringEvent.decode(raw.data, raw.topics),
      type: 'recurring'
    };
    callback(decoded);
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
    let decoded = { ...event.decode(raw.data, raw.topics),
      type: 'single'
    };
    callback(decoded);
  });
  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    let decoded = { ...recurringEvent.decode(raw.data, raw.topics),
      type: 'recurring'
    };
    callback(decoded);
  });
};

exports.onBountyCommit = onBountyCommit;