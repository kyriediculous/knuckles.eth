import {Interface} from 'ethers'
import BountyFactory from '../../../../../contracts/build/contracts/BountyFactory.json'
import Provider from '../Provider'


export function onBountyCreated(provider, callback) {
    let event = (new Interface(BountyFactory.abi)).events.logBountyCreated

    provider.on({
      topics: [event.topics[0]]
    }, raw => {
       callback(raw.map(log => event.parse(log.topics, log.data)))
    })
}
