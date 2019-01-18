"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _web = require("../web3");

var _Users = _interopRequireDefault(require("./Users"));

var _utils = require("ethers/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Timesheets {
  static init({
    ethNetwork,
    swarmHost
  } = {
    ethNetwork: undefined,
    swarmHost: undefined
  }) {
    const timesheets = new Timesheets(); // Initiate EthResolver

    if (ethNetwork === undefined) {
      timesheets.eth = _web.EthResolver.init();
    } else {
      timesheets.eth = _web.EthResolver.init(ethNetwork);
    } // Initiate Swarm connector


    if (swarmHost === undefined) {
      timesheets.bzz = _web.Swarm.init();
    } else {
      timesheets.bzz = _web.Swarm.init(swarmHost);
    }

    return timesheets;
  }

  async reward() {
    return await this.eth.timesheets.reward();
  }

  async setReward(reward, wallet) {
    try {
      return await this.eth.timesheets.setReward(reward, wallet);
    } catch (e) {
      throw Error(e);
    }
  }

  async setPeriod(user, start, completed, wallet) {
    try {
      return await this.eth.timesheets.setPeriod(user, start, completed, wallet);
    } catch (e) {
      throw Error(e);
    }
  }

  async timesheet(user) {
    try {
      let timesheets = await this.eth.timesheets.timesheet(user);
      const users = await _Users.default.init();
      let approvers = await Promise.all(timesheets.map(t => users.get(t.approver)));
      return timesheets.map((t, i) => t.approver = approvers[i]);
    } catch (e) {
      throw Error(e);
    }
  }

  async timesheetRewardsFor(user) {
    try {
      let timesheets = await this.eth.timesheets.timesheet(user);
      return timesheets.map(ts => ({
        user: ts.user,
        reward: ts.reward
      }));
    } catch (e) {
      throw Error(e);
    }
  }

  async last(user) {
    try {
      return await this.eth.timesheets.last(user);
    } catch (err) {
      throw Error(err);
    }
  }

  async totalRewards(user) {
    try {
      let ts = await this.eth.timesheets.timesheet(user);

      if (ts.length == 1) {
        ts = ts[0].reward;
      } else if (ts.length == 0) {
        ts = (0, _utils.bigNumberify)(0);
      } else {
        ts = ts.map(t => t.reward).reduce((a, b) => a.add(b));
      }

      return ts;
    } catch (err) {
      throw Error(err);
    }
  }

}

exports.default = Timesheets;