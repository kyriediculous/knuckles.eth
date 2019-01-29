import {Interface, hexlify, padZeros, arrayify} from 'ethers/utils'
import Token from '../../../contracts/build/contracts/Token.json'
import Provider from '../Provider'

export const onTokenTransfer = (to, callback) =>  {
  const provider = Provider(process.env.CLIENT)
  let event = (new Interface(Token.abi)).events.Transfer
  let topics = [event.topic]
  if (to) topics.push(hexlify(padZeros(arrayify(to), 32)))
  provider.on({
    topics: topics,
    address: Token.networks[provider.network.chainId].address
  }, raw => {
     if ( raw !== undefined ) callback(event.decode(raw.data, raw.topics));
  })
}
