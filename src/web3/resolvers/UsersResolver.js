import UsersRegistry from '../../../contracts/build/contracts/UsersRegistry.json'
import Organisation from '../../../contracts/build/contracts/OrganisationContract.json'
import {parseEther} from 'ethers/utils'
import {stringToHex} from '../../utils/_'

export async function register(name, swarmHash, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer')
    const usersregistry = this.ContractProvider(UsersRegistry, this.provider, wallet)
    let tx = await usersregistry.register(stringToHex(name.toLowerCase()), swarmHash, {gasPrice: parseEther('0')})
    await tx.wait()
    const organisation = this.ContractProvider(Organisation, this.provider, wallet)
    tx = await organisation.join()
    return await tx.wait()
  } catch (err) {
    throw new Error(err)
  }
}

export async function update(newName, swarmHash, oldName, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer')
    const usersregistry = this.ContractProvider(UsersRegistry, this.provider, wallet)
    let tx = await usersregistry.update(stringToHex(newName.toLowerCase()), swarmHash, stringToHex(oldName.toLowerCase()), {gasPrice: parseEther('0')})
    return await tx.wait()
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
