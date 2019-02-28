import TokenFaucet from '../../../contracts/build/contracts/TokenFaucet.json'
import {formatEther, parseEther, bigNumberify} from 'ethers/utils'
import moment from 'moment'
import {Interface} from 'ethers/utils'

//faucet setlimit received limit

export async function faucet(wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer')
    const tokenFaucet = this.ContractProvider(TokenFaucet, this.provider, wallet)
    let tx =  await tokenFaucet.faucet({gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function setLimit(limit, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer')
    const tokenFaucet = this.ContractProvider(TokenFaucet, this.provider, wallet)
    let tx =  await tokenFaucet.setLimit(parseEther(limit.toString()), {gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function received(wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer')
    const tokenFaucet = this.ContractProvider(TokenFaucet, this.provider)
    return await tokenFaucet.received(wallet.address)
  } catch (err) {
    throw new Error(err)
  }
}

export async function currentLimit() {
  try {
    const tokenFaucet = this.ContractProvider(TokenFaucet, this.provider)
    let limit = await tokenFaucet.faucetLimit()
    return  parseFloat(formatEther(bigNumberify(limit))).toFixed(2)
  } catch (err) {
    throw new Error(err)
  }
}

export async function allFaucets() {
  try {
    let faucetEvent = (new Interface(TokenFaucet.abi)).events.logFaucet
    let faucetTopics = [faucetEvent.topic]
    let logs = await this.provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      topics: faucetTopics
    })
    logs = logs.map(log => faucetEvent.decode(log.data, log.topics))
    return logs.map(l => ({
      user: l._user,
      amount: parseFloat(formatEther(bigNumberify(l._amount))).toFixed(2),
      date: moment((l._date.toString(10) * 1000), 'x')
    }))
  } catch (err) {
    throw new Error(err)
  }
}
