import RewardStore from '../artifacts/RewardStore.json'
import {approveSpend, getBalance} from './TokenResolver'
import {parseEther, formatEther} from 'ethers/utils'

//add remove get purchase

export async function add(reference, price, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const rewardStore = this.ContractProvider(RewardStore, wallet)
    let tx = await rewardStore.addListing('0x' + reference, parseEther(price.toString()), {gasPrice: '0x0'})
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function remove(index, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const rewardStore = this.ContractProvider(RewardStore, wallet)
    let tx = await rewardStore.removeListing(index, {gasPrice: '0x0'})
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function get(index) {
  try {
    const rewardStore = this.ContractProvider(RewardStore, this.provider)
    let reward = await rewardStore.listings(index)
    return {
      reference: reward[0],
      price: parseFloat(formatEther(reward[1])).toFixed(2),
      active: reward[2]
    }
  } catch (err) {
    throw new Error(err)
  }
}

export async function update(index, reference, price, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const org = this.ContractProvider(RewardStore, wallet)
    let tx = await org.updateListing(index, '0x'+ reference, parseEther(price.toString()), {gasPrice: '0x0'})
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function getAll() {
  try {
    const rewardStore = this.ContractProvider(RewardStore, this.provider)
    const len = parseInt((await rewardStore.listingsAmount()).toString(10))
    let all = []
    for (var i = 0; i < len; i++) {
      all.push(get.call(this, i))
    }
    all = await Promise.all(all)
    all = all.map((l, i) => {
      return {
        reference: l.reference,
        price: l.price,
        active: l.active,
        id: i
      }
    })
    return all.filter(l => {
      return l.reference.startsWith("0x0000") == false
    })
  } catch (err) {
    throw new Error(err)
  }
}

export async function purchase(item, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const rewardStore = this.ContractProvider(RewardStore, wallet)
    const spend = await approveSpend.call(this, rewardStore.address, item.price, wallet)
    await this.provider.waitForTransaction(spend.hash)
    let tx =  await rewardStore.purchase(item.id)
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function changeStatus(index, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const rewardStore = this.ContractProvider(RewardStore, wallet)
    let tx = await rewardStore.changeActive(index)
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}
