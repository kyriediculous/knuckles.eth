import {Interface} from 'ethers/utils'
import Token from '../artifacts/Token.json'
import Provider from '../Provider'

/*
export const onTokenTransfer = callback => {
    const provider = Provider(process.env.CLIENT)
    let event = (new Interface(Token.abi)).events.Transfer
    provider.on({
      topics: [event.topic],
      address: Token.networks[provider.network.chainId].address
    }, raw => {
       callback(event.decode(raw.data, raw.topics))
    })
}
*/

export const onTokenTransfer = new Promise((resolve, reject) => {
  const provider = Provider(process.env.CLIENT)
  let event = (new Interface(Token.abi)).events.Transfer
  provider.on({
    topics: [event.topic],
    address: Token.networks[provider.network.chainId].address
  }, raw => {
     if ( raw !== undefined ) resolve(raw);
  })
})
