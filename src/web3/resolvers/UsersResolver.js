import UsersRegistry from '../artifacts/UsersRegistry.json'
import Organisation from '../artifacts/OrganisationContract.json'
import {solidityKeccak256 as keccak256} from 'ethers/utils'
import {stringToHex} from '../../utils/_'

export async function register(name, swarmHash, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const usersregistry = this.ContractProvider(UsersRegistry, wallet)
    let tx = await usersregistry.register(stringToHex(name.toLowerCase()), swarmHash, {gasPrice: '0x0'})
    await this.provider.waitForTransaction(tx.hash)
    const organisation = this.ContractProvider(Organisation, wallet)
    tx = await organisation.join()
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function update(newName, swarmHash, oldName, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider
    const usersregistry = this.ContractProvider(UsersRegistry, wallet)
    let tx = await usersregistry.update(stringToHex(newName.toLowerCase()), swarmHash, stringToHex(oldName.toLowerCase()), {gasPrice: '0x0'})
    return this.provider.waitForTransaction(tx.hash)
  } catch (err) {
    throw new Error(err)
  }
}

export async function get (address) {
  try {
    const usersregistry = this.ContractProvider(UsersRegistry, this.provider)
    return await usersregistry.get(address)
  } catch (err) {
    throw new Error(err)
  }
}

export async function ensLookup(name) {
  try {
    const usersregistry = this.ContractProvider(UsersRegistry, this.provider)
    return await usersregistry.ensLookup(stringToHex(name.toLowerCase()))
  } catch (err) {
    throw new Error(err)
  }
}

export async function isAdmin(userAddress) {
  try {
    const organisation = this.ContractProvider(Organisation, this.provider)
    return await organisation.admins(userAddress)
  } catch (err) {
    throw new Error(err)
  }
}
