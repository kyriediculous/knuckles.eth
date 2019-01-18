import Timesheets from '../artifacts/Timesheets.json'
import moment from 'moment'
import {toUtf8Bytes, keccak256, sha256, parseEther, arrayify, padZeros, hexlify, getAddress, formatEther, bigNumberify} from 'ethers/utils'
import {members} from './OrganisationResolver'
import {Interface} from 'ethers/utils'

//setreward, setperiod, getperiod, getperiods

export async function setReward(reward, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const timesheets = this.ContractProvider(Timesheets, wallet)
    let tx = await timesheets.setReward(parseEther(reward.toString()))
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function setPeriod(user, startPeriod, completed, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const timesheets = this.ContractProvider(Timesheets, wallet)
    let tx = await timesheets.setPeriod(user, startPeriod, completed)
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

export async function timesheet(user) {
  try {
    let timesheetEvent = (new Interface(Timesheets.abi)).events.logTimesheetPeriod
    let timesheetTopics = [timesheetEvent.topics[0], hexlify(padZeros(arrayify(user), 32))]
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: timesheetTopics
    })
    logs = logs.map(log => timesheetEvent.parse(log.topics, log.data))
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

export async function timesheetRewards() {
  try {
    let allMembers = await members.call(this)
    let timesheets = await Promise.all(allMembers.map(m => timesheet.call(this, m.user)))
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
    return parseFloat(formatEther(await org.reward())).toFixed(2)
  } catch (err) {
    throw new Error(err)
  }
}
