import BountyFactory from '../../../contracts/build/contracts/BountyFactory.json'
import BountyInterface from '../../../contracts/build/contracts/BountyInterface.json'
import Token from '../../../contracts/build/contracts/Token.json'
import {approveSpend, getBalance} from './TokenResolver'
import moment from 'moment'
import {toUtf8Bytes, keccak256, sha256, parseEther, arrayify, padZeros, hexlify, getAddress, formatEther, bigNumberify} from 'ethers/utils'
import {Contract} from 'ethers'
import {Interface} from 'ethers/utils'
import {sortOldest} from '../../utils/_'

const statusOptions = ["Active", "Completed", "Abandoned"]

function bountyAt(address, provider, wallet = undefined) {
  if (!wallet) return new Contract(address, BountyInterface.abi, provider);
  return new Contract(address, BountyInterface.abi, wallet.connect(provider))
}

//ADD TYPE ? eg. 'normal' , 'recurring'

export async function allBounties () {
  try {
    const bountyFactory = this.ContractProvider(BountyFactory, this.provider)
    let event = (new Interface(BountyFactory.abi)).events.logBountyCreated
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: [event.topic]
    })
    logs = logs.map(log => event.decode(log.data, log.topics))
    logs = logs.map(log => ({
      address:  log.bounty,
      type: 'single'
    }))
    return logs
  } catch (err) {
    throw new Error(err)
  }
}

export async function createBounty(reference, deadline, reward, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    reference = '0x' + reference
    deadline = Date.parse(deadline) / 1000
    reward = parseEther(reward.toString())
    const bountyFactory = this.ContractProvider(BountyFactory, this.provider, wallet)
    const token = this.ContractProvider(Token, this.provider, wallet)
    const spend = await token.approve(bountyFactory.address, reward, {gasPrice: parseEther('0')})
    await spend.wait()
    let tx =  await bountyFactory.createBounty(reference, deadline, reward, {gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function createMintable(reference, deadline, reward, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    reference = '0x' + reference
    deadline = Date.parse(deadline) / 1000
    reward = parseEther(reward.toString())
    const bountyFactory = this.ContractProvider(BountyFactory, this.provider, wallet)
    let tx =  await bountyFactory.createMintableBounty(reference, deadline, reward, {gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function bountiesFrom(userAddress) {
  try {
    const bountyFactory = this.ContractProvider(BountyFactory, this.provider)
    const event = bountyFactory.interface.events.logBountyCreated
    const topics = [event.topic, hexlify(padZeros(arrayify(userAddress), 32))]
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    })
    logs = logs.map(log => event.decode(log.data, log.topics))
    return logs.map(log => ({
      address: log.bounty,
      type: 'single'
    }))
  } catch (err) {
    throw new Error(err)
  }
}

export async function bountyActivityFeed(address) {
  try {
    let startWorkEvent = (new Interface(BountyInterface.abi)).events.logStartWork
    let startWorktopics = [startWorkEvent.topic, null, hexlify(padZeros(arrayify(address), 32))]
    let commitEvent = (new Interface(BountyInterface.abi)).events.logCommit
    let commitTopics = [commitEvent.topic, null, hexlify(padZeros(arrayify(address), 32))]
    let contributeEvent = (new Interface(BountyInterface.abi)).events.logContribute
    let contributeTopics = [contributeEvent.topic, null, hexlify(padZeros(arrayify(address), 32))]
    let acceptEvent = (new Interface(BountyInterface.abi)).events.logAccepted
    let acceptTopics = [acceptEvent.topic, null, hexlify(padZeros(arrayify(address), 32))]
    let cancelEvent = (new Interface(BountyInterface.abi)).events.logCancelled
    let cancelTopics = [cancelEvent.topic, null, hexlify(padZeros(arrayify(address), 32))]
    let startWorkLogs, commitLogs, contributionLogs, acceptedLog, cancelledLog
    [startWorkLogs, commitLogs, contributionLogs, acceptedLog, cancelledLog] = await Promise.all([
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
        fromblock: 0,
        toBlock: 'latest',
        topics: contributeTopics
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
      let ev = startWorkEvent.decode(log.data, log.topics)
      return {
        by: ev._by,
        timestamp: moment((ev._timestamp.toString(10) * 1000), "x"),
        type: 'startWork',
        extraData: null
      }
    })
commitLogs = commitLogs.map(log => {
      let ev = commitEvent.decode(log.data, log.topics)
      return {
        by: ev._by,
        timestamp:moment((ev._timestamp.toString(10) * 1000), "x"),
        type: 'commit',
        extraData: ev._id
      }
    })
  contributionLogs = contributionLogs.map(log => {
      let ev = contributeEvent.decode(log.data, log.topics)
      return {
        by: ev._by,
        timestamp: moment((ev._timestamp.toString(10) * 1000), "x"),
        type: 'contribute',
        extraData: parseFloat(formatEther(bigNumberify(ev._amount))).toFixed(2)
      }
    })

  acceptedLog = acceptedLog.map(log => {
      let ev = acceptEvent.decode(log.data, log.topics)
      return {
        by: ev._winner,
        timestamp: moment((ev._timestamp.toString(10) * 1000), "x"),
        type: 'accepted'
      }
    })
  cancelledLog = cancelledLog.map( log => {
      let ev = cancelEvent.decode(log.data, log.topics)
      return {
        by: ev._by,
        type: 'cancelled',
        timestamp: moment((ev._timestamp.toString(10) * 1000), "x")
      }
    })

    let activityLog = [...startWorkLogs, ...commitLogs, ...contributionLogs, ...acceptedLog, ...cancelledLog]
    activityLog = sortOldest(activityLog)
    return activityLog ? activityLog : []
  } catch (err) {
    throw new Error(err)
  }
}

export async function commitsFrom(userAddress) {
  try {
    const event = (new Interface(BountyInterface.abi)).events.logCommit
    const topics = [event.topic, hexlify(padZeros(arrayify(userAddress), 32))]
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    })
    logs = logs.map(log => event.decode(log.data, log.topics))
    logs = logs.map(l => ({
      type: 'single',
      ...l
    }))
    return logs
  } catch (err) {
    throw new Error(err)
  }
}

export async function rewardsFor(userAddress) {
  try {
    const event = (new Interface(BountyInterface.abi)).events.logAccepted
    const topics = [event.topic, hexlify(padZeros(arrayify(userAddress), 32))]
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: topics
    })
    logs = logs.map(log => event.decode(log.data, log.topics))
    console.log(logs)
    return logs
  } catch (err) {
    throw new Error(err)
  }
}

export async function getBounty(address) {
  try {
    let myBounty = await getMeta.call(this, address)
    let contributions = []
    for (var i = 0; i < myBounty.contributions; i++) {
      contributions.push(i)
    }
    myBounty.contributions = await Promise.all(contributions.map(c => getContribution.call(this, address, c)))

    let commits = []
    for (var i = 0; i < myBounty.commits; i++) {
      commits.push(i)
    }
    myBounty.commits = await Promise.all(commits.map(c => getCommit.call(this, address, c)))

    return myBounty
  } catch (err) {
    throw new Error(err)
  }
}

export async function getMeta(address) {
  try {
    const bounty = bountyAt(address, this.provider)
    let myBounty = await bounty.getBounty()
    myBounty = {
      title: '',
      description: '',
      attachments: [],
      reference: myBounty[0].substring(2),
      issuer: myBounty[1],
      timestamp: moment((myBounty[2].toString(10) * 1000), "x"),
      deadline: moment((myBounty[3].toString(10) * 1000), "x"),
      reward: parseFloat(formatEther(bigNumberify(myBounty[4]))).toFixed(2),
      status: statusOptions[myBounty[5]],
      commits: Number(await bounty.getCommits()),
      contributions: Number(await bounty.getContributions()),
      token: myBounty[6],
      rawTimestamp: parseInt(myBounty[2].toString(10), 10),
      rawDeadline: parseInt(myBounty[3].toString(10), 10)
    }
    return myBounty
  } catch (err) {
    throw new Error(err)
  }
}

export async function cancelBounty(address, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    const bounty = bountyAt(address, this.provider, wallet)
    let tx = await bounty.cancelBounty({
      gasPrice: parseEther('0')
    })
    return tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function cancelMintable(address, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    const bf = this.ContractProvider(BountyFactory, this.provider, wallet)
    let tx = await bf.cancelMintable(address, {gasPrice: parseEther('0')})
    return tx.wait()
  } catch (e) {
    throw new Error(e)
  }
}

export async function contribute(address, amount, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    const bounty = bountyAt(address, this.provider, wallet)
    let spend = await approveSpend.call(this, address, amount, wallet)
    await spend.wait()
    spend = await bounty.contribute(parseEther(amount), {
      gasPrice: parseEther('0')
    })
    return await spend.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function getContribution(address, id) {
  try {
    const bounty = bountyAt(address, this.provider)
    let con = await bounty.getContribution(id)
    con = {
      id: id,
      contributer: con[0],
      token: con[1],
      amount: formatEther(bigNumberify(con[2])),
      timestamp: moment((con[3].toString(10) * 1000), "x")
    }
    return con
  } catch (err) {
    throw new Error(err)
  }
}

export async function getCommit(address, id) {
  try {
    const bounty = bountyAt(address, this.provider)
    let prop = await bounty.getCommit(id)
    prop = {
      reference: prop[0].substring(2),
      author: prop[1],
      accepted: prop[2],
      timestamp: moment((prop[3].toString(10) * 1000), "x"),
      comment: '',
      attachment: '',
      id,
      bounty: address
    }
    return prop
  } catch (err) {
    throw new Error(err.message)
  }
}

export async function acceptCommit(address, id, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    const b = bountyAt(address, this.provider, wallet)
    let tx = await b.acceptCommit(id, {gasPrice: parseEther('0')})
    return await tx.wait()
    return tx
  } catch (e) {
    throw new Error(e)
  }
}

export async function acceptMintable(address, id, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    const bountyFactory = this.ContractProvider(BountyFactory, this.provider, wallet)
    let tx = await bountyFactory.acceptMintable(address, id, {gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (err) {
    throw new Error(err.message)
  }
}

export async function submitCommit(address, reference, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    const b = bountyAt(address, this.provider, wallet)
    reference = '0x' + reference
    let tx = await b.submitCommit(reference, {gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (e) {
    throw new Error(e)
  }
}

export async function proposalCount(address) {
  try {
    const bounty = bountyAt(address, this.provider)
    return Number((await bounty.getCommits()).toString(10))
  } catch (err) {
    throw new Error(err)
  }
}

export async function leaderboard(period) {
  try {
    console.log("Period from resolver: ", period)
    let fromBlock = await this.provider.getBlockNumber()
    switch (period) {
      case 'all':
        fromBlock = 0
        break;
      case '30':
        fromBlock = fromBlock - 518400 > 0 ? fromBlock - 518400 : 0
        break;
      case '90':
        fromBlock = fromBlock - 1555200 > 0 ? fromBlock - 1555200 : 0
    }
    const event = (new Interface(BountyInterface.abi)).events.logAccepted
    const topics = [event.topic]
    let logs = await this.provider.getLogs({
      fromBlock: fromBlock,
      toBlock: 'latest',
      topics: topics
    })
    logs =  logs.map(log => event.decode(log.data, log.topics))
    let leaderboard = Object.values(logs.reduce( (result, {
      _winner,
      _amount
    }) => {
      if (!result[_winner]) result[_winner] = {
        user: _winner,
        rewards: []
      }
      result[_winner].rewards.push(bigNumberify(_amount))
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

export async function startWorking(address, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    const b = bountyAt(address, this.provider, wallet)
    let tx = await b.startWork({gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (e) {
    throw new Error(e)
  }
}

export async function refundContribution(address, contributionId, amount, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    const bounty = bountyAt(address, this.provider, wallet)
    let tx = await bounty.refundContribution(contributionId, parseEther(amount.toString(10)), {gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}
