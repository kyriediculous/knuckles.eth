import {EthResolver, Swarm} from '../web3'
import Users from './Users'

export default class Organisation {
  static init({ethNetwork, swarmHost} = {ethNetwork: undefined, swarmHost: undefined}) {
    const organisation = new Organisation()
    // Initiate EthResolver
    if (ethNetwork === undefined) {
      organisation.eth = EthResolver.init()
    } else {
      organisation.eth = EthResolver.init(ethNetwork)
    }

    // Initiate Swarm connector
    if (swarmHost === undefined) {
      organisation.bzz = Swarm.init()
    } else {
      organisation.bzz = Swarm.init(swarmHost)
    }
    return organisation
  }

  async identity(profile, wallet) {
    try {
      const swarmHash = '0x' + await this.bzz.upload(JSON.stringify(profile), {contentType: "application/json"})
      return await this.eth.organisation.identity(profile.name, swarmHash, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async mint(to, amount, wallet) {
    try {
      return await this.eth.organisation.mint(to, amount, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async addAdmin(user, wallet) {
    try {
      return await this.eth.organisation.addAdmin(user, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async removeAdmin(user, wallet) {
    try {
      return await this.eth.organisation.removeAdmin(user, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async blacklist(user, wallet) {
    try {
      return await this.eth.organisation.blacklist(user, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async whitelist(user, wallet) {
    try {
      return await this.eth.organisation.whitelist(user, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async admins() {
    try {
      let admins = await this.eth.organisation.admins()
      admins = admins.map(a => a.address)
      const users = Users.init()
      admins = await Promise.all(admins.map(a => users.get(a)))
      return admins
    } catch (err) {
      throw Error(err)
    }
  }

  async currentBlacklist() {
    try {
      let bl = await this.eth.organisation.currentBlacklist()
      bl = bl.map(b => b.subject)
      const users = Users.init()
      bl = await Promise.all(bl.map(b => users.get(b)))
      return bl
    } catch (err) {
      throw Error(err)
    }
  }

  async members() {
    try {
      let members = await this.eth.organisation.members()
      members = members.map(m => m.user)
      const users = Users.init()
      return await Promise.all(members.map(m => users.get(m)))
    } catch (err) {
      throw Error(err)
    }
  }

  async requireApproval() {
    try {
      return await this.eth.organisation.requireApproval()
    } catch (err) {
      throw Error(err)
    }
  }

  async pending() {
    try {
      let pendings = await this.eth.organisation.pending()
      const users = Users.init()
      let pendingUsers = await Promise.all(pendings.map(p => users.get(p.user)))
      return pendingUsers
    } catch (err) {
      throw Error(err)
    }
  }

  async approve(user, accepted, wallet) {
    try {
      return await this.eth.organisation.approve(user, accepted, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async toggleApproval(wallet) {
    try {
      return await this.eth.organisation.toggleApproval(wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async isPending(user) {
    try {
      return await this.eth.organisation.isPending(user)
    } catch (err) {
      throw Error(err)
    }
  }
}
