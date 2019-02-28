import {EthResolver, Swarm} from '../web3'

class Users {
  //Default ganache & localhost
  static init({ethNetwork, swarmHost} = {ethNetwork: undefined, swarmHost: undefined}) {
    try {
      const users = new Users()

      // Initiate EthResolver
      if (ethNetwork === undefined) {
        users.eth = EthResolver.init()
      } else {
        users.eth = EthResolver.init(ethNetwork)
      }

      // Initiate Swarm connector
      if (swarmHost === undefined) {
        users.bzz = Swarm.init()
      } else {
        users.bzz = Swarm.init(swarmHost)
      }
      return users
    } catch (err) {
      throw new Error(err)
    }
  }

  async register(profile, wallet) {
    try {
      const swarmHash = '0x' + await this.bzz.upload(JSON.stringify(profile), {contentType: 'application/json'})
      await this.eth.users.register(profile.name, swarmHash, wallet)
    } catch (err) {
      throw new Error(err)
    }
  }

  async update(profile, oldName, wallet) {
    try {
      const swarmHash = '0x' + await this.bzz.upload(JSON.stringify(profile), {contentType: 'application/json'})
      await this.eth.users.update(profile.name, swarmHash, oldName, wallet)
    } catch (err) {
      throw new Error(err)
    }
  }

  async get(userAddress) {
    try {
      const swarmHash = await this.eth.users.get(userAddress)
      if (swarmHash.startsWith('0x00000000000000000000000')) {
        return {
          name: 'Not Found',
          email: 'Not Found',
          bio:  'Not Found',
          avatar:  'Not Found',
          isAdmin:  false
        }
        //throw new Error('Can not retrieve nil values from Swarm')
      }
      let profile = await this.bzz.download(swarmHash.substring(2))
      profile = JSON.parse(await profile.text())
      if(!profile.avatar) {
        profile.avatar = '' //blockies.create({seed: userAddress, size:25, scale:4})
      }
      profile.isAdmin = await this.eth.users.isAdmin(userAddress)
      profile.address = userAddress
      return profile ? profile :  {
        name: 'Not Found',
        email: 'Not Found',
        bio:  'Not Found',
        avatar:  'Not Found',
        isAdmin:  'Not Found'
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  async lookup(name) {
    try {
      const address = await this.eth.users.lookup(name)
      const user = await this.get(address)
      const avatar = user.avatar ? user.avatar : ''
      return {address, avatar, name}
    } catch (err) {
      throw new Error(err)
    }
  }

}

export default Users
