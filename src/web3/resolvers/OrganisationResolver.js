import Organisation from '../artifacts/OrganisationContract.json'
import {Interface} from 'ethers'
import {parseEther, formatEther} from 'ethers/utils'
import {stringToHex} from '../../utils/conversion'
import {isAdmin} from './UsersResolver'

//identity , minttokens , addAdmin , removeAdmin , blacklistMember , removeBlacklistMember
export async function setIdentity(name, swarmHash, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const organisation = this.ContractProvider(Organisation, wallet)
    let tx =  await organisation.setOrganisationIdentity(stringToHex(name.toLowerCase()), swarmHash, {gasPrice: '0x0'})
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function mintTokens(to, amount, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const organisation = this.ContractProvider(Organisation, wallet)
    let tx = await organisation.mintToken(to, parseEther(amount.toString()), {gasPrice: '0x0'})
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function addAdmin(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const organisation = this.ContractProvider(Organisation, wallet)
    let tx = await organisation.addAdmin(address, {gasPrice: '0x0'})
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function removeAdmin(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const organisation = this.ContractProvider(Organisation, wallet)
    let tx = await organisation.removeAdmin(address, {gasPrice: '0x0'})
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function blacklist(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const organisation = this.ContractProvider(Organisation, wallet)
    let tx = await organisation.blacklist(address)
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function whitelist(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const organisation = this.ContractProvider(Organisation, wallet)
    let tx = await organisation.whitelist(address)
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function adminChanges() {
  try {
    let adminEvent =  (new Interface(Organisation.abi)).events.logAdminChange
    let adminTopics = [adminEvent.topics[0]]
    let logs = await this.provider.getLogs({
      fromBlock: 1,
      toBlock: 'latest',
      topics: adminTopics
    })
    logs = logs.map(log => adminEvent.parse(log.topics, log.data))
    return logs.map(l => ({
      subject: l._changedAdmin,
      status: l._status,
      by: l._setBy,
      timestamp: l._timestamp
    }))
  } catch (err) {
    throw new Error(err)
  }
}

export async function admins() {
  try {
    let events = await adminChanges.call(this)
    events = events.map(e => e.subject)
    let addresses = Array.from(new Set(events))
    let admins = await Promise.all(addresses.map(a => isAdmin.call(this, a)))
    for (var i = 0; i < addresses.length; i++) {
      admins[i] = {
        address: addresses[i],
        admin: admins[i]
      }
    }
    //Filter 0X0 values because I was stupid
    admins = admins.filter(a => a.address.startsWith("0x00000") == false)
    return admins.filter(a => a.admin)
  } catch (err) {
    throw new Error(err)
  }
}

export async function isBlacklist(user) {
  try {
    const organisation = this.ContractProvider(Organisation, this.provider)
    return await organisation.blacklisted(user)
  } catch (err) {
    throw new Error(err)
  }
}

export async function currentBlacklist() {
  try {
    let blEvent = (new Interface(Organisation.abi)).events.logBlacklist
    let blTopics = [blEvent.topics[0]]
    let logs = await this.provider.getLogs({
      fromBlock: 1,
      toBlock: 'latest',
      topics: blTopics
    })
    logs = logs.map(l => {
      l = blEvent.parse(l.topics, l.data)
      return l._subject
    })
    logs = Array.from(new Set(logs))
    let blacklist = await Promise.all(logs.map(l => isBlacklist.call(this, l)))
    for (var i =0; i < blacklist.length; i++) {
      blacklist[i] = {
        subject: logs[i],
        blocked: blacklist[i]
      }
    }
    return blacklist.filter(bl => bl.blocked)
  } catch (err) {
    throw new Error(err)
  }
}

export async function isMember(address) {
    try {
      const org = this.ContractProvider(Organisation, this.provider)
      return await org.members(address)
    } catch (err) {
      throw new Error(err)
    }
}

export async function members() {
  try {
    let joinEvent = (new Interface(Organisation.abi)).events.logJoin
    let joinTopics = [joinEvent.topics[0]]
    let logs = await this.provider.getLogs({
      fromBlock: 1,
      toBlock: 'latest',
      topics: joinTopics
    })
    logs = logs.map(l => joinEvent.parse(l.topics, l.data))
    logs = logs.map(l => l._user)
    logs = Array.from(new Set(logs))
    let isMembers = await Promise.all(logs.map(l => isMember.call(this, l)))
    logs = logs.map((l, i) => ({user: l, isMember: isMembers[i]}))
    //filter for true
    return logs.filter(l => l.isMember)
  } catch (err) {
    throw new Error(err)
  }
}

export async function requireApproval() {
  try {
    const org = this.ContractProvider(Organisation, this.provider)
    return await org.requireApproval()
  } catch (err) {
    throw new Error(err)
  }
}

export async function pending() {
  try {
    let joinEvent = (new Interface(Organisation.abi)).events.logJoin
    let joinTopics = [joinEvent.topics[0]]
    let logs = await this.provider.getLogs({
      fromBlock: 1,
      toBlock: 'latest',
      topics: joinTopics
    })
    logs = logs.map(l => joinEvent.parse(l.topics, l.data))
    logs = logs.map(l => l._user)
    logs = Array.from(new Set(logs))
    const org = this.ContractProvider(Organisation, this.provider)
    let pendings =  await Promise.all(logs.map(l => org.pending(l)))
    logs = logs.map((l, i) => {
      return {
        user: l,
        pending: pendings[i]
      }
    })
    return logs.filter(l => l.pending == true)
  } catch (err) {
    throw new Error(err)
  }
}

export async function approve(user, accepted, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const org = this.ContractProvider(Organisation, wallet)
    let tx = await org.approve(user, accepted)
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function toggleApproval(wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const org = this.ContractProvider(Organisation, wallet)
    let tx = await org.toggleApproval()
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function isPending(user) {
  try {
    const org = this.ContractProvider(Organisation, this.provider)
    return await org.pending(user)
  } catch (err) {
    throw new Error(err)
  }
}
