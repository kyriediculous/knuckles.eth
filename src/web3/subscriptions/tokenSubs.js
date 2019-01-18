import {Interface} from 'ethers/utils'
import Token from '../artifacts/Token.json'
import Provider from '../Provider'

export const onTokenTransfer = (provider, callback) => {
    let event = (new Interface(Token.abi)).events.Transfer
    provider.on({
      topics: [event.topic],
      address: Token.networks[provider.network.chainId].address
    }, raw => {
       callback(event.decode(raw.data, raw.topics))
    })
}
