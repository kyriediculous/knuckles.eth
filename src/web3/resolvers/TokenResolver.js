import Token from '../../../contracts/build/contracts/Token.json'
import {formatEther, parseEther, bigNumberify} from 'ethers/utils'

export async function getBalance(address) {
  try {
    const token = this.ContractProvider(Token, this.provider)
    let balance = await token.balanceOf(address)
    return formatEther(bigNumberify(balance))
  } catch (err) {
    throw new Error('Unable to retrieve token balance' + err)
  }
}

export async function sendTokens(recipient, amount, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer')
    const token = this.ContractProvider(Token, this.provider, wallet)
    if (typeof amount != 'string') {
      amount = amount.toString()
    }
    amount = parseEther(amount)
    let tx = await token.transfer(recipient, amount, {gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function approveSpend(recipient, amount, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer')
    const token = this.ContractProvider(Token, this.provider, wallet)
    if (typeof amount != 'string') {
      amount = amount.toString()
    }
    amount = parseEther(amount)
    let tx = await token.approve(recipient, amount, {gasPrice: parseEther('0')})
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function getAllowance(approver, spender) {
  try {
    const token = this.ContractProvider(Token, this.provider)
    let balance = await token.allowance(approver, spender)
    return formatEther(bigNumberify(balance))
  } catch (err) {
    throw new Error('Unable to retrieve token allowance', err)
  }
}

export async function tokenInfo() {
  try {
    const token = this.ContractProvider(Token, this.provider)
    const supply = await token.totalSupply()
    const name = await token.name()
    const symbol = await token.symbol()
    const decimals = await token.decimals()
    return {
      name,
      symbol,
      supply,
      decimals
    }
  } catch (err) {
    throw new Error('Error retrieving token details', err)
  }
}

export function address() {
  const token = this.ContractProvider(Token, this.provider)
  return token.address
}
