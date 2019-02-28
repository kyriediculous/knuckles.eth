"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setIdentity = setIdentity;
exports.mintTokens = mintTokens;
exports.addAdmin = addAdmin;
exports.removeAdmin = removeAdmin;
exports.blacklist = blacklist;
exports.whitelist = whitelist;
exports.adminChanges = adminChanges;
exports.admins = admins;
exports.isBlacklist = isBlacklist;
exports.currentBlacklist = currentBlacklist;
exports.isMember = isMember;
exports.members = members;
exports.requireApproval = requireApproval;
exports.pending = pending;
exports.approve = approve;
exports.toggleApproval = toggleApproval;
exports.isPending = isPending;

var _OrganisationContract = _interopRequireDefault(require("../../../contracts/build/contracts/OrganisationContract.json"));

var _utils = require("ethers/utils");

var _ = require("../../utils/_");

var _UsersResolver = require("./UsersResolver");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//identity , minttokens , addAdmin , removeAdmin , blacklistMember , removeBlacklistMember
async function setIdentity(name, swarmHash, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const organisation = this.ContractProvider(_OrganisationContract.default, this.provider, wallet);
    let tx = await organisation.setOrganisationIdentity((0, _.stringToHex)(name.toLowerCase()), swarmHash, {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function mintTokens(to, amount, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const organisation = this.ContractProvider(_OrganisationContract.default, this.provider, wallet);
    let tx = await organisation.mintToken(to, (0, _utils.parseEther)(amount.toString()), {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function addAdmin(address, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const organisation = this.ContractProvider(_OrganisationContract.default, this.provider, wallet);
    let tx = await organisation.addAdmin(address, {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function removeAdmin(address, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const organisation = this.ContractProvider(_OrganisationContract.default, this.provider, wallet);
    let tx = await organisation.removeAdmin(address, {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function blacklist(address, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const organisation = this.ContractProvider(_OrganisationContract.default, this.provider, wallet);
    let tx = await organisation.blacklist(address, {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function whitelist(address, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const organisation = this.ContractProvider(_OrganisationContract.default, this.provider, wallet);
    let tx = await organisation.whitelist(address, {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function adminChanges() {
  try {
    let adminEvent = new _utils.Interface(_OrganisationContract.default.abi).events.logAdminChange;
    let adminTopics = [adminEvent.topic];
    let logs = await this.provider.getLogs({
      fromBlock: 1,
      toBlock: 'latest',
      topics: adminTopics
    });
    logs = logs.map(log => adminEvent.decode(log.data, log.topics));
    return logs.map(l => ({
      subject: l._changedAdmin,
      status: l._status,
      by: l._setBy,
      timestamp: l._timestamp
    }));
  } catch (err) {
    throw new Error(err);
  }
}

async function admins() {
  try {
    let events = await adminChanges.call(this);
    events = events.map(e => e.subject);
    let addresses = Array.from(new Set(events));
    let admins = await Promise.all(addresses.map(a => _UsersResolver.isAdmin.call(this, a)));

    for (var i = 0; i < addresses.length; i++) {
      admins[i] = {
        address: addresses[i],
        admin: admins[i]
      };
    } //Filter 0X0 values because I was stupid


    admins = admins.filter(a => a.address.startsWith('0x00000') == false);
    return admins.filter(a => a.admin);
  } catch (err) {
    throw new Error(err);
  }
}

async function isBlacklist(user) {
  try {
    const organisation = this.ContractProvider(_OrganisationContract.default, this.provider);
    return await organisation.blacklisted(user);
  } catch (err) {
    throw new Error(err);
  }
}

async function currentBlacklist() {
  try {
    let blEvent = new _utils.Interface(_OrganisationContract.default.abi).events.logBlacklist;
    let blTopics = [blEvent.topic];
    let logs = await this.provider.getLogs({
      fromBlock: 1,
      toBlock: 'latest',
      topics: blTopics
    });
    logs = logs.map(l => {
      l = blEvent.decode(l.data, l.topics);
      return l._subject;
    });
    logs = Array.from(new Set(logs));
    let blacklist = await Promise.all(logs.map(l => isBlacklist.call(this, l)));

    for (var i = 0; i < blacklist.length; i++) {
      blacklist[i] = {
        subject: logs[i],
        blocked: blacklist[i]
      };
    }

    return blacklist.filter(bl => bl.blocked);
  } catch (err) {
    throw new Error(err);
  }
}

async function isMember(address) {
  try {
    const org = this.ContractProvider(_OrganisationContract.default, this.provider);
    return await org.members(address);
  } catch (err) {
    throw new Error(err);
  }
}

async function members() {
  try {
    let joinEvent = new _utils.Interface(_OrganisationContract.default.abi).events.logJoin;
    let joinTopics = [joinEvent.topic];
    let logs = await this.provider.getLogs({
      fromBlock: 1,
      toBlock: 'latest',
      topics: joinTopics
    });
    logs = logs.map(l => joinEvent.decode(l.data, l.topics));
    logs = logs.map(l => l._user);
    logs = Array.from(new Set(logs));
    let isMembers = await Promise.all(logs.map(l => isMember.call(this, l)));
    logs = logs.map((l, i) => ({
      user: l,
      isMember: isMembers[i]
    })); //filter for true

    return logs.filter(l => l.isMember);
  } catch (err) {
    throw new Error(err);
  }
}

async function requireApproval() {
  try {
    const org = this.ContractProvider(_OrganisationContract.default, this.provider);
    return await org.requireApproval();
  } catch (err) {
    throw new Error(err);
  }
}

async function pending() {
  try {
    let joinEvent = new _utils.Interface(_OrganisationContract.default.abi).events.logJoin;
    let joinTopics = [joinEvent.topic];
    let logs = await this.provider.getLogs({
      fromBlock: 1,
      toBlock: 'latest',
      topics: joinTopics
    });
    logs = logs.map(l => joinEvent.decode(l.data, l.topics));
    logs = logs.map(l => l._user);
    logs = Array.from(new Set(logs));
    const org = this.ContractProvider(_OrganisationContract.default, this.provider);
    let pendings = await Promise.all(logs.map(l => org.pending(l)));
    logs = logs.map((l, i) => {
      return {
        user: l,
        pending: pendings[i]
      };
    });
    return logs.filter(l => l.pending == true);
  } catch (err) {
    throw new Error(err);
  }
}

async function approve(user, accepted, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const org = this.ContractProvider(_OrganisationContract.default, this.provider, wallet);
    let tx = await org.approve(user, accepted, {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function toggleApproval(wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const org = this.ContractProvider(_OrganisationContract.default, this.provider, wallet);
    let tx = await org.toggleApproval({
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function isPending(user) {
  try {
    const org = this.ContractProvider(_OrganisationContract.default, this.provider);
    return await org.pending(user);
  } catch (err) {
    throw new Error(err);
  }
}