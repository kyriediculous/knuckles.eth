import {EthResolver, Swarm} from '../web3'

class Token {
  static init({ethNetwork, swarmHost} = {ethNetwork: undefined, swarmHost: undefined}) {
    const token = new Token()

    if(ethNetwork === undefined) {
      token.eth = EthResolver.init()
    } else {
      token.eth = EthResolver.init(ethNetwork)
    }

    if (swarmHost === undefined) {
      token.bzz = Swarm.init()
    } else {
      token.bzz = Swarm.init(swarmHost)
    }
    return token
  }

  async balance(address) {
    try {
      return await this.eth.token.getBalance(address)
    } catch (err) {
      throw new Error(err)
    }
  }

  async send(to, amount, wallet) {
    try {
      return await this.eth.token.send(to, amount, wallet)
    } catch (err) {
      throw new Error(err)
    }
  }

  async approve(to, amount, wallet) {
    try {
      return await this.eth.token.approveSpend(to, amount, wallet)
    } catch (err) {
      throw new Error(err)
    }
  }

  async allowance(approver, spender) {
    try {
      return await this.eth.token.getAllowance(approver, spender)
    } catch (err) {
      throw new Error(err)
    }
  }

  async info() {
    try {
      return await this.eth.token.tokenInfo()
    } catch (err) {
      throw new Error(err)
    }
  }

  address() {
    return this.eth.token.address()
  }
}

export default Token
