import RecurringBountyFactory from '../../../../../contracts/build/contracts/RecurringBountyFactory.json'
import RecurringBountyInterface from '../../../../../contracts/build/contracts/RecurringBountyInterface.json'
import {approveSpend, getBalance, sendTokens} from './TokenResolver'
import moment from 'moment'
import {toUtf8Bytes, keccak256, sha256, parseEther, arrayify, padZeros, hexlify, getAddress, formatEther} from 'ethers/utils'
import {Contract, Interface} from 'ethers'

import {sortOldest} from '../../utils/_'

function bountyAt(address, walletOrProvider) {
  return new Contract(address, RecurringBountyInterface.abi, walletOrProvider);
}

const statusOptions = ["Active", "Completed", "Abandoned"]

export async function allRecurringBounties() {
  try {
    const event = (new Interface(RecurringBountyFactory.abi)).events.logRecurringBountyCreated
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: [event.topics[0]]
    })
    logs = logs.map(l => event.parse(l.topics, l.data))
    logs = logs.map(l =>( {
      address: l.bounty,
      type: 'recurring'
    }))
    return logs
  } catch (e) {
    throw new Error(e)
  }
}

export async function recurringBountiesFrom(userAddress)  {
  try {
    const event = (new Interface(RecurringBountyFactory.abi)).events.logRecurringBountyCreated
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: [event.topics[0], hexlify(padZeros(arrayify(userAddress), 32))]
    })
    logs = logs.map(l => event.parse(l.topics, l.data))
    return logs.map(l => ({
      address: l.bounty,
      type: 'recurring'
    }))
  } catch (e) {
    throw new Error(e)
  }
}

export async function createRecurringBounty(reference, deadline, reward, funding, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    reference = '0x' + reference
    deadline = Date.parse(deadline) / 1000
    funding = parseEther(funding.toString())
    reward = parseEther(reward.toString())
    const recurringBountyFactory = this.ContractProvider(RecurringBountyFactory, wallet)
    let spend = await approveSpend.call(this, recurringBountyFactory.address, funding, wallet)
    spend = await this.provider.waitForTransaction(spend.hash)
    let creation = await recurringBountyFactory.createBounty(reference, deadline, reward, funding, {gasPrice: '0x0'})
    creation = await this.provider.waitForTransaction(creation.hash)
    return this.provider.getTransactionReceipt(creation.hash)
  } catch (e) {
    throw new Error(e)
  }
}

export async function getRecurringBounty(address) {
  try {
    let data = await getRecurringBountyMeta.call(this, address)
    let commits = []
    for (var i = 0; i < data.commits; i++) {
      commits.push(i)
    }
    data.commits = await Promise.all(commits.map(c => getCommit.call(this, address, c)))
    data.funding = await getBalance.call(this, address)
    return data
  } catch (e) {
    throw new Error(e)
  }
}

export async function getRecurringBountyMeta(address) {
  try {
    const b = bountyAt(address, this.provider)
    let data = await b.getBounty()
    data = {
      title: '',
      description: '',
      attachments: [],
      reference: data[0].substring(2),
      issuer: data[1],
      timestamp: moment((data[2].toString(10) * 1000), "x"),
      deadline: moment((data[3].toString(10) * 1000), "x"),
      reward: parseFloat(formatEther(data[4])).toFixed(2),
      status: statusOptions[data[5]],
      commits: Number(await b.getCommits()),
      token: data[6],
      rawTimestamp: parseInt(data[2].toString(10), 10),
      rawDeadline: parseInt(data[3].toString(10), 10)
    }
    return data
  } catch (e) {
    throw new Error(e)
  }
}

export async function startWork(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const b = bountyAt(address, wallet)
    let tx = await b.startWork({gasPrice: '0x0'})
    tx = await this.provider.waitForTransaction(tx.hash)
    return
  } catch (e) {
    throw new Error(e)
  }
}

export async function cancelRecurringBounty(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const b = bountyAt(address, wallet)
    let tx = await b.cancelBounty()
    tx = await this.provider.waitForTransaction(tx.hash)
    return await this.provider.getTransactionReceipt(tx.hash)
  } catch (e) {
    throw new Error(e)
  }
}

export async function cancelMintable(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const rbf = this.ContractProvider(RecurringBountyFactory, wallet)
    let tx = await rbf.cancelMintable(address, {gasPrice: '0x0'})
    tx = await this.provider.waitForTransaction(tx.hash)
    return await this.provider.getTransactionReceipt(tx.hash)
  } catch (e) {
    throw new Error(e)
  }
}

export async function getCommit(address, id) {
  try {
    const b = bountyAt(address, this.provider)
    let data = await b.getCommit(id)
    data = {
      reference: data[0].substring(2),
      author: data[1],
      accepted: data[2],
      timestamp: moment((data[3].toString(10) * 1000), 'x'),
      comment: '',
      attachment: '',
      id,
      bounty: address
    }
    return data
  } catch (e) {
    throw new Error(e)
  }
}

export async function getCommits() {
  try {
    const b = bountyAt(address, this.provider)
    return Number((await b.getCommits()).toString(10))
  } catch (e) {
    throw new Error(e)
  }
}

export async function commitsFrom(address) {
  try {
    const event = (new Interface(RecurringBountyInterface.abi)).events.logRecurringCommit
    const topics = [event.topics[0], hexlify(padZeros(arrayify(address), 32))]
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    })
    logs = logs.map(log => event.parse(log.topics, log.data))
    logs = logs.map(l => {
      l.type = 'recurring'
      return l
    })
    return logs
  } catch (e) {
    throw new Error(e)
  }
}

export async function withdrawFunding(address, amount, token, wallet) {
  try {
    if (token == '') token = hexlify(0);
    if (wallet.provider === undefined) wallet.provider = this.provider
    amount = parseEther(amount.toString())
    const b = bountyAt(address, wallet)
    let tx = await b.withdraw(amount, token, {gasPrice: '0x0'})
    tx = await this.provider.waitForTransaction(tx.hash)
    return
  } catch (e) {
    throw new Error(e)
  }
}

export async function createMintable(reference, deadline, reward, funding, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    reference = '0x' + reference
    deadline = Date.parse(deadline) / 1000
    funding = parseEther(funding.toString())
    reward = parseEther(reward.toString())
    const rbf = this.ContractProvider(RecurringBountyFactory, wallet)
    let tx = await rbf.createMintableBounty(reference, deadline, reward, funding, {gasPrice: '0x0'})
    tx = await this.provider.waitForTransaction(tx.hash)
    return await this.provider.getTransactionReceipt(tx.hash)
  } catch (e) {
    throw new Error(e)
  }
}

export async function acceptMintable(address, id , wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const rbf = this.ContractProvider(RecurringBountyFactory, wallet)
    let tx = await rbf.acceptMintable(address, id, {gasPrice: '0x0'})
    tx = await this.provider.waitForTransaction(tx.hash)
    return await this.provider.getTransactionReceipt(tx.hash)
  } catch (e) {
    throw new Error(e)
  }
}

export async function addFunding(address, amount, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    await sendTokens.call(this, address, amount, wallet)
    return
  } catch (e) {
    throw new Error(e)
  }
}

export async function mintFunding(address, amount, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const rbf = this.ContractProvider(RecurringBountyFactory, wallet)
    let tx = await rbf.mintFunding(address, amount, {gasPrice: '0x0'})
    tx = await this.provider.waitForTransaction(tx.hash)
    return
  } catch (e) {
    throw new Error(e)
  }
}


export async function rewardsFor(address) {
  try {
    const event = (new Interface(RecurringBountyInterface.abi)).events.logRecurringAccepted
    const topics = [event.topics[0], hexlify(padZeros(arrayify(address), 32))]
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    })
    logs = logs.map(log => event.parse(log.topics, log.data))
    return logs
  } catch (e) {
    throw new Error(e)
  }
}

export async function startWorking(address, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const b = bountyAt(address, wallet)
    let tx = await b.startWork({gasPrice: '0x0'})
    tx = await this.provider.waitForTransaction(tx.hash)
  } catch (e) {
    throw new Error(e)
  }
}

export async function bountyActivityFeed(address) {
  try {
    let startWorkEvent = (new Interface(RecurringBountyInterface.abi)).events.logRecurringStartWork
    let startWorktopics = [startWorkEvent.topics[0], null, hexlify(padZeros(arrayify(address), 32))]
    let commitEvent = (new Interface(RecurringBountyInterface.abi)).events.logRecurringCommit
    let commitTopics = [commitEvent.topics[0], null, hexlify(padZeros(arrayify(address), 32))]
    let acceptEvent = (new Interface(RecurringBountyInterface.abi)).events.logRecurringAccepted
    let acceptTopics = [acceptEvent.topics[0], null, hexlify(padZeros(arrayify(address), 32))]
    let cancelEvent = (new Interface(RecurringBountyInterface.abi)).events.logRecurringCancelled
    let cancelTopics = [cancelEvent.topics[0], null, hexlify(padZeros(arrayify(address), 32))]
    let startWorkLogs, commitLogs, contributionLogs, acceptedLog, cancelledLog
    [startWorkLogs, commitLogs, acceptedLog, cancelledLog] = await Promise.all([
      this.provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        topics: startWorktopics
      }),
      this.provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        topics: commitTopics
      }),
      this.provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        topics: acceptTopics
      }),
      this.provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        topics: cancelTopics
      })
    ])

    startWorkLogs = startWorkLogs.map(log => {
      let ev = startWorkEvent.parse(log.topics, log.data)
      return {
        by: ev._by,
        timestamp: moment((ev._timestamp.toString(10) * 1000), "x"),
        type: 'startWork',
        extraData: null
      }
    })
commitLogs = commitLogs.map(log => {
      let ev = commitEvent.parse(log.topics, log.data)
      return {
        by: ev._by,
        timestamp:moment((ev._timestamp.toString(10) * 1000), "x"),
        type: 'commit',
        extraData: ev._id
      }
    })

  acceptedLog = acceptedLog.map(log => {
      let ev = acceptEvent.parse(log.topics, log.data)
      return {
        by: ev._winner,
        timestamp: moment((ev._timestamp.toString(10) * 1000), "x"),
        type: 'accepted'
      }
    })
  cancelledLog = cancelledLog.map( log => {
      let ev = cancelEvent.parse(log.topics, log.data)
      return {
        by: ev._by,
        type: 'cancelled',
        timestamp: moment((ev._timestamp.toString(10) * 1000), "x")
      }
    })

    let activityLog = [...startWorkLogs, ...commitLogs, ...acceptedLog, ...cancelledLog]
    activityLog = sortOldest(activityLog)
    return activityLog ? activityLog : []
  } catch (err) {
    throw new Error(err)
  }
}


export async function leaderboard() {
  try {
    const event = (new Interface(RecurringBountyInterface.abi)).events.logRecurringAccepted
    const topics = [event.topics[0]]
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    })
    logs =  logs.map(log => event.parse(log.topics, log.data))
    let leaderboard = Object.values(logs.reduce( (result, {
      _winner,
      _amount
    }) => {
      if (!result[_winner]) result[_winner] = {
        user: _winner,
        rewards: []
      }
      result[_winner].rewards.push(_amount)
      return result
    },
    {}
  ))
    leaderboard.forEach(person => {
      return person.rewards = person.rewards.reduce( (a,b) => a.add(b))
    })
    return leaderboard
  } catch (err) {
    throw new Error(err)
  }
}
