import TokenFaucet from '../../../../../contracts/build/contracts/TokenFaucet.json'
import {formatEther, parseEther} from 'ethers/utils'
import moment from 'moment'

//faucet setlimit received limit

export async function faucet(wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const tokenFaucet = this.ContractProvider(TokenFaucet, wallet)
    let tx =  await tokenFaucet.faucet()
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function setLimit(limit, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const tokenFaucet = this.ContractProvider(TokenFaucet, wallet)
    let tx =  await tokenFaucet.setLimit(parseEther(limit.toString()))
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function received(wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const tokenFaucet = this.ContractProvider(TokenFaucet, wallet)
    return await tokenFaucet.received(wallet.address)
  } catch (err) {
    throw new Error(err)
  }
}

export async function currentLimit() {
  try {
    const tokenFaucet = this.ContractProvider(TokenFaucet, this.provider)
    let limit = await tokenFaucet.faucetLimit()
    return  parseFloat(formatEther(limit)).toFixed(2)
  } catch (err) {
    throw new Error(err)
  }
}

export async function allFaucets() {
  try {
    const tokenFaucet = this.ContractProvider(TokenFaucet, this.provider)
    let faucetEvent = (new Interface(TokenFaucet.abi)).events.logFaucet
    let faucetTopics = [faucetEvent.topics[0]]
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: faucetTopics
    })
    logs = logs.map(log => faucetEvent.parse(log.topics, log.data))
    return logs.map(l => ({
      user: l._user,
      amount: parseFloat(formatEther(l._amount)).toFixed(2),
      date: moment((l._date.toString(10) * 1000), "x")
    }))
  } catch (err) {
    throw new Error(err)
  }
}
