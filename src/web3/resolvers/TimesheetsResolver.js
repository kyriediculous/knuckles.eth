import Timesheets from '../../../contracts/build/contracts/Timesheets.json'
import moment from 'moment'
import {toUtf8Bytes, keccak256, sha256, parseEther, arrayify, padZeros, hexlify, getAddress, formatEther, bigNumberify} from 'ethers/utils'
import {members} from './OrganisationResolver'
import {Interface} from 'ethers/utils'

//setreward, setperiod, getperiod, getperiods

export async function setReward(reward, wallet) {
  try {
    if (wallet === undefined) throw new Error("Must supply a signer")
    const timesheets = this.ContractProvider(Timesheets, this.provider, wallet)
    let tx = await timesheets.setReward(parseEther(reward.toString()), {gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function setPeriod(user, startPeriod, completed, wallet) {
  try {
  if (wallet === undefined) throw new Error("Must supply a signer")
    const timesheets = this.ContractProvider(Timesheets, this.provider, wallet)
    let tx = await timesheets.setPeriod(user, startPeriod, completed, {gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function getPeriod(user, index) {
  try {
    const timesheets = this.ContractProvider(Timesheets, this.provider)
    let period = await timesheets.timsheets(user, index)
    return {
      startData: moment((period[0].toString(10) * 1000), "x"),
      completed: period[1]
    }
  } catch (err) {
    throw new Error(err)
  }
}

export async function timesheet(user, period) {
  try {
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
    let timesheetEvent = (new Interface(Timesheets.abi)).events.logTimesheetPeriod
    let timesheetTopics = [timesheetEvent.topic, hexlify(padZeros(arrayify(user), 32))]
    let logs = await this.provider.getLogs({
      fromBlock: fromBlock,
      toBlock: 'latest',
      topics: timesheetTopics
    })
    logs = logs.map(log => timesheetEvent.decode(log.data, log.topics))
    return logs.map(l => {
      return {
        user: l._user,
        start: moment((l._periodStart.toString(10) * 1000), "x"),
        completed: l._completed,
        approver: l._approver,
        reward: l._reward
      }
    })
  } catch (err) {
    throw new Error(err)
  }
}

export async function timesheetRewards(period) {
  try {
    let allMembers = await members.call(this)
    let timesheets = await Promise.all(allMembers.map(m => timesheet.call(this, m.user, period)))
    return timesheets.map((ts, i) => {
      if (ts.length == 1 ) {
        return {
          user: allMembers[i].user,
          rewards: ts[0].reward
        }
      } else if (ts.length == 0) {
        return {
          user: allMembers[i].user,
          rewards: bigNumberify(0)
        }
      } else {
        return {
          user: allMembers[i].user,
          rewards: ts.map(t => t.reward).reduce((a, b) => a.add(b))
        }
      }
    })
  } catch (err) {
    throw Error (err)
  }
}

export async function getLast(user) {
  try {
    const org = this.ContractProvider(Timesheets, this.provider)
    let last = await org.getLast(user)
    return {
      start: parseInt(last[0].toString(10), 10),
      completed: last[1]
    }
  } catch (err) {
    throw new Error(err)
  }
}

export async function reward() {
  try {
    const org = this.ContractProvider(Timesheets, this.provider)
    return parseFloat(formatEther(bigNumberify(await org.reward()))).toFixed(2)
  } catch (err) {
    throw new Error(err)
  }
}
