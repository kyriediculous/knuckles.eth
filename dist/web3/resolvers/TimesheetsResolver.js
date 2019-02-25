"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setReward = setReward;
exports.setPeriod = setPeriod;
exports.getPeriod = getPeriod;
exports.timesheet = timesheet;
exports.timesheetRewards = timesheetRewards;
exports.getLast = getLast;
exports.reward = reward;

var _Timesheets = _interopRequireDefault(require("../../../contracts/build/contracts/Timesheets.json"));

var _moment = _interopRequireDefault(require("moment"));

var _utils = require("ethers/utils");

var _OrganisationResolver = require("./OrganisationResolver");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//setreward, setperiod, getperiod, getperiods
async function setReward(reward, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer");
    const timesheets = this.ContractProvider(_Timesheets.default, this.provider, wallet);
    let tx = await timesheets.setReward((0, _utils.parseEther)(reward.toString()), {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function setPeriod(user, startPeriod, completed, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer");
    const timesheets = this.ContractProvider(_Timesheets.default, this.provider, wallet);
    let tx = await timesheets.setPeriod(user, startPeriod, completed, {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function getPeriod(user, index) {
  try {
    const timesheets = this.ContractProvider(_Timesheets.default, this.provider);
    let period = await timesheets.timsheets(user, index);
    return {
      startData: (0, _moment.default)(period[0].toString(10) * 1000, "x"),
      completed: period[1]
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function timesheet(user, period) {
  try {
    let fromBlock = await this.provider.getBlockNumber();

    switch (period) {
      case 'all':
        fromBlock = 0;
        break;

      case 'monthly':
        fromBlock = fromBlock - 518400 > 0 ? fromBlock - 518400 : 0;
        break;

      case 'quarterly':
        fromBlock = fromBlock - 1555200 > 0 ? fromBlock - 1555200 : 0;
    }

    let timesheetEvent = new _utils.Interface(_Timesheets.default.abi).events.logTimesheetPeriod;
    let timesheetTopics = [timesheetEvent.topic, (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(user), 32))];
    let logs = await this.provider.getLogs({
      fromBlock: fromBlock,
      toBlock: 'latest',
      topics: timesheetTopics
    });
    logs = logs.map(log => timesheetEvent.decode(log.data, log.topics));
    return logs.map(l => {
      return {
        user: l._user,
        start: (0, _moment.default)(l._periodStart.toString(10) * 1000, "x"),
        completed: l._completed,
        approver: l._approver,
        reward: l._reward
      };
    });
  } catch (err) {
    throw new Error(err);
  }
}

async function timesheetRewards(period) {
  try {
    let allMembers = await _OrganisationResolver.members.call(this);
    let timesheets = await Promise.all(allMembers.map(m => timesheet.call(this, m.user, period)));
    return timesheets.map((ts, i) => {
      if (ts.length == 1) {
        return {
          user: allMembers[i].user,
          rewards: ts[0].reward
        };
      } else if (ts.length == 0) {
        return {
          user: allMembers[i].user,
          rewards: (0, _utils.bigNumberify)(0)
        };
      } else {
        return {
          user: allMembers[i].user,
          rewards: ts.map(t => t.reward).reduce((a, b) => a.add(b))
        };
      }
    });
  } catch (err) {
    throw Error(err);
  }
}

async function getLast(user) {
  try {
    const org = this.ContractProvider(_Timesheets.default, this.provider);
    let last = await org.getLast(user);
    return {
      start: parseInt(last[0].toString(10), 10),
      completed: last[1]
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function reward() {
  try {
    const org = this.ContractProvider(_Timesheets.default, this.provider);
    return parseFloat((0, _utils.formatEther)((0, _utils.bigNumberify)((await org.reward())))).toFixed(2);
  } catch (err) {
    throw new Error(err);
  }
}