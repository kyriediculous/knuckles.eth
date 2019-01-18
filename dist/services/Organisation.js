"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _web = require("../web3");

var _Users = _interopRequireDefault(require("./Users"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Organisation {
  static init({
    ethNetwork,
    swarmHost
  } = {
    ethNetwork: undefined,
    swarmHost: undefined
  }) {
    const organisation = new Organisation(); // Initiate EthResolver

    if (ethNetwork === undefined) {
      organisation.eth = _web.EthResolver.init();
    } else {
      organisation.eth = _web.EthResolver.init(ethNetwork);
    } // Initiate Swarm connector


    if (swarmHost === undefined) {
      organisation.bzz = _web.Swarm.init();
    } else {
      organisation.bzz = _web.Swarm.init(swarmHost);
    }

    return organisation;
  }

  async identity(profile, wallet) {
    try {
      const swarmHash = '0x' + (await this.bzz.upload(JSON.stringify(profile), {
        contentType: "application/json"
      }));
      return await this.eth.organisation.identity(profile.name, swarmHash, wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async mint(to, amount, wallet) {
    try {
      return await this.eth.organisation.mint(to, amount, wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async addAdmin(user, wallet) {
    try {
      return await this.eth.organisation.addAdmin(user, wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async removeAdmin(user, wallet) {
    try {
      return await this.eth.organisation.removeAdmin(user, wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async blacklist(user, wallet) {
    try {
      return await this.eth.organisation.blacklist(user, wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async whitelist(user, wallet) {
    try {
      return await this.eth.organisation.whitelist(user, wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async admins() {
    try {
      let admins = await this.eth.organisation.admins();
      admins = admins.map(a => a.address);

      const users = _Users.default.init();

      admins = await Promise.all(admins.map(a => users.get(a)));
      return admins;
    } catch (err) {
      throw Error(err);
    }
  }

  async currentBlacklist() {
    try {
      let bl = await this.eth.organisation.currentBlacklist();
      bl = bl.map(b => b.subject);

      const users = _Users.default.init();

      bl = await Promise.all(bl.map(b => users.get(b)));
      return bl;
    } catch (err) {
      throw Error(err);
    }
  }

  async members() {
    try {
      let members = await this.eth.organisation.members();
      members = members.map(m => m.user);

      const users = _Users.default.init();

      return await Promise.all(members.map(m => users.get(m)));
    } catch (err) {
      throw Error(err);
    }
  }

  async requireApproval() {
    try {
      return await this.eth.organisation.requireApproval();
    } catch (err) {
      throw Error(err);
    }
  }

  async pending() {
    try {
      let pendings = await this.eth.organisation.pending();

      const users = _Users.default.init();

      let pendingUsers = await Promise.all(pendings.map(p => users.get(p.user)));
      return pendingUsers;
    } catch (err) {
      throw Error(err);
    }
  }

  async approve(user, accepted, wallet) {
    try {
      return await this.eth.organisation.approve(user, accepted, wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async toggleApproval(wallet) {
    try {
      return await this.eth.organisation.toggleApproval(wallet);
    } catch (err) {
      throw Error(err);
    }
  }

  async isPending(user) {
    try {
      return await this.eth.organisation.isPending(user);
    } catch (err) {
      throw Error(err);
    }
  }

}

exports.default = Organisation;