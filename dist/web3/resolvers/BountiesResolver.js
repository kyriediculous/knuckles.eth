"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.allBounties = allBounties;
exports.createBounty = createBounty;
exports.createMintable = createMintable;
exports.bountiesFrom = bountiesFrom;
exports.bountyActivityFeed = bountyActivityFeed;
exports.commitsFrom = commitsFrom;
exports.rewardsFor = rewardsFor;
exports.getBounty = getBounty;
exports.getMeta = getMeta;
exports.cancelBounty = cancelBounty;
exports.cancelMintable = cancelMintable;
exports.contribute = contribute;
exports.getContribution = getContribution;
exports.getCommit = getCommit;
exports.acceptCommit = acceptCommit;
exports.acceptMintable = acceptMintable;
exports.submitCommit = submitCommit;
exports.proposalCount = proposalCount;
exports.leaderboard = leaderboard;
exports.startWorking = startWorking;
exports.refundContribution = refundContribution;

var _BountyFactory = _interopRequireDefault(require("../artifacts/BountyFactory.json"));

var _BountyInterface = _interopRequireDefault(require("../artifacts/BountyInterface.json"));

var _Token = _interopRequireDefault(require("../artifacts/Token.json"));

var _TokenResolver = require("./TokenResolver");

var _moment = _interopRequireDefault(require("moment"));

var _utils = require("ethers/utils");

var _ethers = require("ethers");

var _ = require("../../utils/_");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const statusOptions = ["Active", "Completed", "Abandoned"];

function bountyAt(address, walletOrProvider) {
  return new _ethers.Contract(address, _BountyInterface.default.abi, walletOrProvider);
} //ADD TYPE ? eg. 'normal' , 'recurring'


async function allBounties() {
  try {
    const bountyFactory = this.ContractProvider(_BountyFactory.default, this.provider);
    let event = new _ethers.Interface(_BountyFactory.default.abi).events.logBountyCreated;
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: [event.topics[0]]
    });
    logs = logs.map(log => event.parse(log.topics, log.data));
    logs = logs.map(log => ({
      address: log.bounty,
      type: 'single'
    }));
    return logs;
  } catch (err) {
    throw new Error(err);
  }
}

async function createBounty(reference, deadline, reward, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    reference = '0x' + reference;
    deadline = Date.parse(deadline) / 1000;
    reward = (0, _utils.parseEther)(reward.toString());
    const bountyFactory = this.ContractProvider(_BountyFactory.default, wallet);
    const token = this.ContractProvider(_Token.default, wallet);
    const spend = await token.approve(bountyFactory.address, reward, {
      gasPrice: '0x0'
    });
    await this.provider.waitForTransaction(spend.hash);
    let tx = await bountyFactory.createBounty(reference, deadline, reward, {
      gasPrice: '0x0'
    });
    tx = await this.provider.waitForTransaction(tx.hash);
    return tx;
  } catch (err) {
    throw new Error(err);
  }
}

async function createMintable(reference, deadline, reward, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    reference = '0x' + reference;
    deadline = Date.parse(deadline) / 1000;
    reward = (0, _utils.parseEther)(reward.toString());
    const bountyFactory = this.ContractProvider(_BountyFactory.default, wallet);
    let tx = await bountyFactory.createMintableBounty(reference, deadline, reward, {
      gasPrice: '0x0'
    });
    tx = await this.provider.waitForTransaction(tx.hash);
    tx = await this.provider.getTransactionReceipt(tx.hash);
    return tx;
  } catch (err) {
    throw new Error(err);
  }
}

async function bountiesFrom(userAddress) {
  try {
    const bountyFactory = this.ContractProvider(_BountyFactory.default, this.provider);
    const event = bountyFactory.interface.events.logBountyCreated;
    const topics = [event.topics[0], (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(userAddress), 32))];
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    });
    logs = logs.map(log => event.parse(log.topics, log.data));
    return logs.map(log => ({
      address: log.bounty,
      type: 'single'
    }));
  } catch (err) {
    throw new Error(err);
  }
}

async function bountyActivityFeed(address) {
  try {
    let startWorkEvent = new _ethers.Interface(_BountyInterface.default.abi).events.logStartWork;
    let startWorktopics = [startWorkEvent.topics[0], null, (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let commitEvent = new _ethers.Interface(_BountyInterface.default.abi).events.logCommit;
    let commitTopics = [commitEvent.topics[0], null, (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let contributeEvent = new _ethers.Interface(_BountyInterface.default.abi).events.logContribute;
    let contributeTopics = [contributeEvent.topics[0], null, (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let acceptEvent = new _ethers.Interface(_BountyInterface.default.abi).events.logAccepted;
    let acceptTopics = [acceptEvent.topics[0], null, (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let cancelEvent = new _ethers.Interface(_BountyInterface.default.abi).events.logCancelled;
    let cancelTopics = [cancelEvent.topics[0], null, (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(address), 32))];
    let startWorkLogs, commitLogs, contributionLogs, acceptedLog, cancelledLog;
    [startWorkLogs, commitLogs, contributionLogs, acceptedLog, cancelledLog] = await Promise.all([this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: startWorktopics
    }), this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: commitTopics
    }), this.provider.getLogs({
      fromblock: 0,
      toBlock: 'latest',
      topics: contributeTopics
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
    contributionLogs = contributionLogs.map(log => {
      let ev = contributeEvent.parse(log.topics, log.data);
      return {
        by: ev._by,
        timestamp: (0, _moment.default)(ev._timestamp.toString(10) * 1000, "x"),
        type: 'contribute',
        extraData: parseFloat((0, _utils.formatEther)(ev._amount)).toFixed(2)
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
    let activityLog = [...startWorkLogs, ...commitLogs, ...contributionLogs, ...acceptedLog, ...cancelledLog];
    activityLog = (0, _.sortOldest)(activityLog);
    return activityLog ? activityLog : [];
  } catch (err) {
    throw new Error(err);
  }
}

async function commitsFrom(userAddress) {
  try {
    const event = new _ethers.Interface(_BountyInterface.default.abi).events.logCommit;
    const topics = [event.topics[0], (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(userAddress), 32))];
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    });
    logs = logs.map(log => event.parse(log.topics, log.data));
    logs = logs.map(l => {
      l.type = 'single';
      return l;
    });
    return logs;
  } catch (err) {
    throw new Error(err);
  }
}

async function rewardsFor(userAddress) {
  try {
    const event = new _ethers.Interface(_BountyInterface.default.abi).events.logAccepted;
    const topics = [event.topics[0], (0, _utils.hexlify)((0, _utils.padZeros)((0, _utils.arrayify)(userAddress), 32))];
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    });
    return logs.map(log => event.parse(log.topics, log.data));
  } catch (err) {
    throw new Error(err);
  }
}

async function getBounty(address) {
  try {
    let myBounty = await getMeta.call(this, address);
    let contributions = [];

    for (var i = 0; i < myBounty.contributions; i++) {
      contributions.push(i);
    }

    myBounty.contributions = await Promise.all(contributions.map(c => getContribution.call(this, address, c)));
    let commits = [];

    for (var i = 0; i < myBounty.commits; i++) {
      commits.push(i);
    }

    myBounty.commits = await Promise.all(commits.map(c => getCommit.call(this, address, c)));
    return myBounty;
  } catch (err) {
    throw new Error(err);
  }
}

async function getMeta(address) {
  try {
    const bounty = bountyAt(address, this.provider);
    let myBounty = await bounty.getBounty();
    myBounty = {
      title: '',
      description: '',
      attachments: [],
      reference: myBounty[0].substring(2),
      issuer: myBounty[1],
      timestamp: (0, _moment.default)(myBounty[2].toString(10) * 1000, "x"),
      deadline: (0, _moment.default)(myBounty[3].toString(10) * 1000, "x"),
      reward: parseFloat((0, _utils.formatEther)(myBounty[4])).toFixed(2),
      status: statusOptions[myBounty[5]],
      commits: Number((await bounty.getCommits())),
      contributions: Number((await bounty.getContributions())),
      token: myBounty[6],
      rawTimestamp: parseInt(myBounty[2].toString(10), 10),
      rawDeadline: parseInt(myBounty[3].toString(10), 10)
    };
    return myBounty;
  } catch (err) {
    throw new Error(err);
  }
}

async function cancelBounty(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const bounty = bountyAt(address, wallet);
    let tx = await bounty.cancelBounty({
      gasPrice: '0x0'
    });
    tx = await this.provider.waitForTransaction(tx.hash);
    return await this.provider.getTransactionReceipt(tx.hash);
  } catch (err) {
    throw new Error(err);
  }
}

async function cancelMintable(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const bf = this.ContractProvider(_BountyFactory.default, wallet);
    let tx = await bf.cancelMintable(address, {
      gasPrice: '0x0'
    });
    tx = await this.provider.waitForTransaction(tx.hash);
    return await this.provider.getTransactionReceipt(tx.hash);
  } catch (e) {
    throw new Error(e);
  }
}

async function contribute(address, amount, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const bounty = bountyAt(address, wallet);
    let spend = await _TokenResolver.approveSpend.call(this, address, amount, wallet);
    spend = await this.provider.waitForTransaction(spend.hash);
    spend = await bounty.contribute((0, _utils.parseEther)(amount), {
      gasPrice: '0x0'
    });
    spend = await this.provider.waitForTransaction(spend.hash);
    return spend;
  } catch (err) {
    throw new Error(err);
  }
}

async function getContribution(address, id) {
  try {
    const bounty = bountyAt(address, this.provider);
    let con = await bounty.getContribution(id);
    con = {
      id: id,
      contributer: con[0],
      token: con[1],
      amount: (0, _utils.formatEther)(con[2]),
      timestamp: (0, _moment.default)(con[3].toString(10) * 1000, "x")
    };
    return con;
  } catch (err) {
    throw new Error(err);
  }
}

async function getCommit(address, id) {
  try {
    const bounty = bountyAt(address, this.provider);
    let prop = await bounty.getCommit(id);
    prop = {
      reference: prop[0].substring(2),
      author: prop[1],
      accepted: prop[2],
      timestamp: (0, _moment.default)(prop[3].toString(10) * 1000, "x"),
      comment: '',
      attachment: '',
      id,
      bounty: address
    };
    return prop;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function acceptCommit(address, id, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const b = bountyAt(address, wallet);
    let tx = await b.acceptCommit(id, {
      gasPrice: '0x0'
    });
    tx = await this.provider.waitForTransaction(tx.hash);
    return await this.provider.getTransactionReceipt(tx.hash);
    return tx;
  } catch (e) {
    throw new Error(e);
  }
}

async function acceptMintable(address, id, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const bountyFactory = this.ContractProvider(_BountyFactory.default, wallet);
    let tx = await bountyFactory.acceptMintable(address, id, {
      gasPrice: '0x0'
    });
    tx = await this.provider.waitForTransaction(tx.hash);
    return await this.provider.getTransactionReceipt(tx.hash);
  } catch (err) {
    throw new Error(err.message);
  }
}

async function submitCommit(address, reference, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const b = bountyAt(address, wallet);
    reference = '0x' + reference;
    let tx = await b.submitCommit(reference, {
      gasPrice: '0x0'
    });
    tx = await this.provider.waitForTransaction(tx.hash);
  } catch (e) {
    throw new Error(e);
  }
}

async function proposalCount(address) {
  try {
    const bounty = bountyAt(address, this.provider);
    return Number((await bounty.getCommits()).toString(10));
  } catch (err) {
    throw new Error(err);
  }
}

async function leaderboard() {
  try {
    const event = new _ethers.Interface(_BountyInterface.default.abi).events.logAccepted;
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

async function startWorking(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const b = bountyAt(address, wallet);
    let tx = await b.startWork({
      gasPrice: '0x0'
    });
    tx = await this.provider.waitForTransaction(tx.hash);
  } catch (e) {
    throw new Error(e);
  }
}

async function refundContribution(address, contributionId, amount, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const bounty = bountyAt(address, wallet);
    let tx = await bounty.refundContribution(contributionId, (0, _utils.parseEther)(amount.toString(10)), {
      gasPrice: '0x0'
    });
    tx = this.provider.waitForTransaction(tx.hash);
    return tx;
  } catch (err) {
    throw new Error(err);
  }
}