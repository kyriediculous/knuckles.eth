import {Interface} from 'ethers/utils'
import Token from '../artifacts/Token.json'
import Provider from '../Provider'

export const onTokenTransfer = (provider, callback) => {
    let event = (new Interface(Token.abi)).events.Transfer
    provider.on({
      topics: [event.topics[0]],
      address: Token.networks[provider.chainId].address
    }, raw => {
       callback(event.parse(raw.topics, raw.data))
    })
}
