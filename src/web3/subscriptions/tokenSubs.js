import {Contract, Interface} from 'ethers'
import Token from '../artifacts/Token.json'
import Provider from '../Provider'
import ContractProvider from '../ContractProvider'

export const onTokenTransfer = (provider, callback) => {
    //let event = (new Interface(Token.abi)).events.Transfer
    let token = new Contract(Token.networks[provider.chainId].address, Token.abi, provider)
    //let token2 = ContractProvider(Token, provider)
    provider.on({
      topics: [event.topics[0]],
      address: Token.networks[provider.chainId].address
    }, raw => {
       callback(raw.map(log => event.parse(log.topics, log.data)))
    })
}
