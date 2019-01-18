"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.allRecurringBounties = allRecurringBounties;
exports.recurringBountiesFrom = recurringBountiesFrom;
exports.createRecurringBounty = createRecurringBounty;
exports.getRecurringBounty = getRecurringBounty;
exports.getRecurringBountyMeta = getRecurringBountyMeta;
exports.startWork = startWork;
exports.cancelRecurringBounty = cancelRecurringBounty;
exports.cancelMintable = cancelMintable;
exports.getCommit = getCommit;
exports.getCommits = getCommits;
exports.commitsFrom = commitsFrom;
exports.withdrawFunding = withdrawFunding;
exports.createMintable = createMintable;
exports.acceptMintable = acceptMintable;
exports.addFunding = addFunding;
exports.mintFunding = mintFunding;
exports.rewardsFor = rewardsFor;
exports.startWorking = startWorking;
exports.bountyActivityFeed = bountyActivityFeed;
exports.leaderboard = leaderboard;

var _RecurringBountyFactory = _interopRequireDefault(require("../artifacts/RecurringBountyFactory.json"));

var _RecurringBountyInterface = _interopRequireDefault(require("../artifacts/RecurringBountyInterface.json"));

var _TokenResolver = require("./TokenResolver");

var _moment = _interopRequireDefault(require("moment"));

var _utils = require("ethers/utils");

var _ethers = require("ethers");

var _ = require("../../utils/_");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bountyAt(address, walletOrProvider) {
  return new _ethers.Contract(address, _RecurringBountyInterface.default.abi, walletOrProvider);
}

const statusOptions = ["Active", "Completed", "Abandoned"];

async function allRecurringBounties() {
  try {
    const event = (0, _utils.Interface)(_RecurringBountyFactory.default.abi).events.logRecurringBountyCreated;
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: [event.topics[0]]
    });
    logs = logs.map(l => event.parse(l.topics, l.data));
    logs = logs.map(l => ({
      address: l.bounty,
      type: 'recurring'
    }));
    return logs;
  } catch (e) {
    throw new Error(e);
  }
}

async function recurringBountiesFrom(userAddress) {
  try {
    const event = (0, _utils.Interface)(_RecurringBountyFactory.default.abi).events.logRecurringBountyCreated;
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: [event.topics[0], (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(userAddress), 32))]
    });
    logs = logs.map(l => event.parse(l.topics, l.data));
    return logs.map(l => ({
      address: l.bounty,
      type: 'recurring'
    }));
  } catch (e) {
    throw new Error(e);
  }
}

async function createRecurringBounty(reference, deadline, reward, funding, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    reference = '0x' + reference;
    deadline = Date.parse(deadline) / 1000;
    funding = (0, _utils.parseEther)(funding.toString());
    reward = (0, _utils.parseEther)(reward.toString());
    const recurringBountyFactory = this.ContractProvider(_RecurringBountyFactory.default, wallet);
    let spend = await _TokenResolver.approveSpend.call(this, recurringBountyFactory.address, funding, wallet);
    await spend.wait();
    let creation = await recurringBountyFactory.createBounty(reference, deadline, reward, funding, {
      gasPrice: '0x0'
    });
    return await creation.wait();
  } catch (e) {
    throw new Error(e);
  }
}

async function getRecurringBounty(address) {
  try {
    let data = await getRecurringBountyMeta.call(this, address);
    let commits = [];

    for (var i = 0; i < data.commits; i++) {
      commits.push(i);
    }

    data.commits = await Promise.all(commits.map(c => getCommit.call(this, address, c)));
    data.funding = await _TokenResolver.getBalance.call(this, address);
    return data;
  } catch (e) {
    throw new Error(e);
  }
}

async function getRecurringBountyMeta(address) {
  try {
    const b = bountyAt(address, this.provider);
    let data = await b.getBounty();
    data = {
      title: '',
      description: '',
      attachments: [],
      reference: data[0].substring(2),
      issuer: data[1],
      timestamp: (0, _moment.default)(data[2].toString(10) * 1000, "x"),
      deadline: (0, _moment.default)(data[3].toString(10) * 1000, "x"),
      reward: parseFloat((0, _utils.formatEther)(data[4])).toFixed(2),
      status: statusOptions[data[5]],
      commits: Number((await b.getCommits())),
      token: data[6],
      rawTimestamp: parseInt(data[2].toString(10), 10),
      rawDeadline: parseInt(data[3].toString(10), 10)
    };
    return data;
  } catch (e) {
    throw new Error(e);
  }
}

async function startWork(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const b = bountyAt(address, wallet);
    let tx = await b.startWork({
      gasPrice: '0x0'
    });
    return await tx.wait();
  } catch (e) {
    throw new Error(e);
  }
}

async function cancelRecurringBounty(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const b = bountyAt(address, wallet);
    let tx = await b.cancelBounty();
    return await tx.wait();
  } catch (e) {
    throw new Error(e);
  }
}

async function cancelMintable(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const rbf = this.ContractProvider(_RecurringBountyFactory.default, wallet);
    let tx = await rbf.cancelMintable(address, {
      gasPrice: '0x0'
    });
    return await tx.wait();
  } catch (e) {
    throw new Error(e);
  }
}

async function getCommit(address, id) {
  try {
    const b = bountyAt(address, this.provider);
    let data = await b.getCommit(id);
    data = {
      reference: data[0].substring(2),
      author: data[1],
      accepted: data[2],
      timestamp: (0, _moment.default)(data[3].toString(10) * 1000, 'x'),
      comment: '',
      attachment: '',
      id,
      bounty: address
    };
    return data;
  } catch (e) {
    throw new Error(e);
  }
}

async function getCommits() {
  try {
    const b = bountyAt(address, this.provider);
    return Number((await b.getCommits()).toString(10));
  } catch (e) {
    throw new Error(e);
  }
}

async function commitsFrom(address) {
  try {
    const event = (0, _utils.Interface)(_RecurringBountyInterface.default.abi).events.logRecurringCommit;
    const topics = [event.topics[0], (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    });
    logs = logs.map(log => event.parse(log.topics, log.data));
    logs = logs.map(l => {
      l.type = 'recurring';
      return l;
    });
    return logs;
  } catch (e) {
    throw new Error(e);
  }
}

async function withdrawFunding(address, amount, token, wallet) {
  try {
    if (token == '') token = (0, _utils.hexlify)(0);
    if (wallet.provider === undefined) wallet.provider = this.provider;
    amount = (0, _utils.parseEther)(amount.toString());
    const b = bountyAt(address, wallet);
    let tx = await b.withdraw(amount, token, {
      gasPrice: '0x0'
    });
    return await tx.wait();
  } catch (e) {
    throw new Error(e);
  }
}

async function createMintable(reference, deadline, reward, funding, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    reference = '0x' + reference;
    deadline = Date.parse(deadline) / 1000;
    funding = (0, _utils.parseEther)(funding.toString());
    reward = (0, _utils.parseEther)(reward.toString());
    const rbf = this.ContractProvider(_RecurringBountyFactory.default, wallet);
    let tx = await rbf.createMintableBounty(reference, deadline, reward, funding, {
      gasPrice: '0x0'
    });
    return await tx.wait();
  } catch (e) {
    throw new Error(e);
  }
}

async function acceptMintable(address, id, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const rbf = this.ContractProvider(_RecurringBountyFactory.default, wallet);
    let tx = await rbf.acceptMintable(address, id, {
      gasPrice: '0x0'
    });
    return await tx.wait();
  } catch (e) {
    throw new Error(e);
  }
}

async function addFunding(address, amount, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    await _TokenResolver.sendTokens.call(this, address, amount, wallet);
    return;
  } catch (e) {
    throw new Error(e);
  }
}

async function mintFunding(address, amount, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const rbf = this.ContractProvider(_RecurringBountyFactory.default, wallet);
    let tx = await rbf.mintFunding(address, amount, {
      gasPrice: '0x0'
    });
    return await tx.wait();
  } catch (e) {
    throw new Error(e);
  }
}

async function rewardsFor(address) {
  try {
    const event = (0, _utils.Interface)(_RecurringBountyInterface.default.abi).events.logRecurringAccepted;
    const topics = [event.topics[0], (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    });
    logs = logs.map(log => event.parse(log.topics, log.data));
    return logs;
  } catch (e) {
    throw new Error(e);
  }
}

async function startWorking(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const b = bountyAt(address, wallet);
    let tx = await b.startWork({
      gasPrice: '0x0'
    });
    return await tx.wait();
  } catch (e) {
    throw new Error(e);
  }
}

async function bountyActivityFeed(address) {
  try {
    let startWorkEvent = (0, _utils.Interface)(_RecurringBountyInterface.default.abi).events.logRecurringStartWork;
    let startWorktopics = [startWorkEvent.topics[0], null, (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let commitEvent = (0, _utils.Interface)(_RecurringBountyInterface.default.abi).events.logRecurringCommit;
    let commitTopics = [commitEvent.topics[0], null, (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let acceptEvent = (0, _utils.Interface)(_RecurringBountyInterface.default.abi).events.logRecurringAccepted;
    let acceptTopics = [acceptEvent.topics[0], null, (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let cancelEvent = (0, _utils.Interface)(_RecurringBountyInterface.default.abi).events.logRecurringCancelled;
    let cancelTopics = [cancelEvent.topics[0], null, (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let startWorkLogs, commitLogs, contributionLogs, acceptedLog, cancelledLog;
    [startWorkLogs, commitLogs, acceptedLog, cancelledLog] = await Promise.all([this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: startWorktopics
    }), this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: commitTopics
    }), this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: acceptTopics
    }), this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: cancelTopics
    })]);
    startWorkLogs = startWorkLogs.map(log => {
      let ev = startWorkEvent.parse(log.topics, log.data);
      return {
        by: ev._by,
        timestamp: (0, _moment.default)(ev._timestamp.toString(10) * 1000, "x"),
        type: 'startWork',
        extraData: null
      };
    });
    commitLogs = commitLogs.map(log => {
      let ev = commitEvent.parse(log.topics, log.data);
      return {
        by: ev._by,
        timestamp: (0, _moment.default)(ev._timestamp.toString(10) * 1000, "x"),
        type: 'commit',
        extraData: ev._id
      };
    });
    acceptedLog = acceptedLog.map(log => {
      let ev = acceptEvent.parse(log.topics, log.data);
      return {
        by: ev._winner,
        timestamp: (0, _moment.default)(ev._timestamp.toString(10) * 1000, "x"),
        type: 'accepted'
      };
    });
    cancelledLog = cancelledLog.map(log => {
      let ev = cancelEvent.parse(log.topics, log.data);
      return {
        by: ev._by,
        type: 'cancelled',
        timestamp: (0, _moment.default)(ev._timestamp.toString(10) * 1000, "x")
      };
    });
    let activityLog = [...startWorkLogs, ...commitLogs, ...acceptedLog, ...cancelledLog];
    activityLog = (0, _.sortOldest)(activityLog);
    return activityLog ? activityLog : [];
  } catch (err) {
    throw new Error(err);
  }
}

async function leaderboard() {
  try {
    const event = (0, _utils.Interface)(_RecurringBountyInterface.default.abi).events.logRecurringAccepted;
    const topics = [event.topics[0]];
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    });
    logs = logs.map(log => event.parse(log.topics, log.data));
    let leaderboard = Object.values(logs.reduce((result, {
      _winner,
      _amount
    }) => {
      if (!result[_winner]) result[_winner] = {
        user: _winner,
        rewards: []
      };

      result[_winner].rewards.push(_amount);

      return result;
    }, {}));
    leaderboard.forEach(person => {
      return person.rewards = person.rewards.reduce((a, b) => a.add(b));
    });
    return leaderboard;
  } catch (err) {
    throw new Error(err);
  }
}