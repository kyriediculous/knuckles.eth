const clients = {
  development: 'http://localhost:8500',
  knuckles: 'https://knuckle-swarm.designisdead.com'
}

import {SwarmClient} from '@erebos/swarm'
class Swarm {
  static init(host = clients[process.env.CLIENT]) {
    const swarm = new Swarm()
    swarm.bzz = ( new SwarmClient({bzz: {url: host}})).bzz
    swarm.host = host
    return swarm
  }

  async upload(file, options) {
    return this.bzz.upload(file, options)
  }

  async download(hash) {
    const res = await this.bzz.download(hash)
    return res
  }
}

export default Swarm
