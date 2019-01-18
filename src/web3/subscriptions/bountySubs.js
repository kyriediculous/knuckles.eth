import {Interface} from 'ethers/utils'

import BountyFactory from '../artifacts/BountyFactory.json'
import Provider from '../Provider'


export const onBountyCreated = (provider, callback) => {
    let event = (new Interface(BountyFactory.abi)).events.logBountyCreated

    provider.on({
      topics: [event.topic]
    }, raw => {
       callback(event.decode(raw.data, raw.topics))
    })
}
