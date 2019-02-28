import {EthResolver, Swarm} from '../web3'

export default class Rewards {
  static init({ethNetwork, swarmHost} = {ethNetwork: undefined, swarmHost: undefined}) {
    const rewards = new Rewards()
    // Initiate EthResolver
    if (ethNetwork === undefined) {
      rewards.eth = EthResolver.init()
    } else {
      rewards.eth = EthResolver.init(ethNetwork)
    }

    // Initiate Swarm connector
    if (swarmHost === undefined) {
      rewards.bzz = Swarm.init()
    } else {
      rewards.bzz = Swarm.init(swarmHost)
    }
    return rewards
  }

  async add(item, price, wallet) {
    try {
      let swarmHash = await this.bzz.upload(JSON.stringify(item), {contentType: 'application/json'})
      return await this.eth.rewards.add(swarmHash, price, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async remove(id, wallet) {
    try {
      return await this.eth.rewards.remove(id, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async all() {
    try {
      let all =  await this.eth.rewards.all()
      let references = await Promise.all(all.map(a => this.bzz.download(a.reference.substring(2))))
      for (var i = 0; i < all.length; i++) {
        all[i].details = JSON.parse(await references[i].text())
      }
      let manifests = await Promise.all(all.map(a => {
        if (a.details.picture == '') {
          return ''
        } else {
          return this.bzz.bzz.list(a.details.picture)
        }
      }))
      let attachments = manifests.map((m, i) => {
        if (m.entries) {
          return {
            name: m.entries[0].path,
            url: this.bzz.host + '/bzz:/' + all[i].details.picture + '/' + m.entries[0].path,
            raw: all[i].details.picture
          }
        } else {
          return {
            name: '',
            url: '',
            raw: ''
          }
        }
      })
      for (var l = 0; l < all.length; l++) {
        all[l].details.picture = attachments[l]
      }
      return all
    } catch (err) {
      throw Error(err)
    }
  }

  async update(id, item, price, wallet) {
    try {
      let swarmHash = await this.bzz.upload(JSON.stringify(item), {contentType: 'application/json'})
      return await this.eth.rewards.update(id, swarmHash, price, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async purchase(id, wallet) {
    try {
      return await this.eth.rewards.purchase(id, wallet)
    } catch (err) {
      throw Error(err)
    }
  }

  async changeStatus(id, wallet) {
    try {
      return await this.eth.rewards.changeStatus(id, wallet)
    } catch (err) {
      throw Error(err)
    }
  }
}
