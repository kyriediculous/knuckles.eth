import {Interface} from 'ethers/utils'

import BountyFactory from '../artifacts/BountyFactory.json'
import RecurringBountyFactory from '../artifacts/RecurringBountyFactory.json'

import Provider from '../Provider'


export const onBountyCreated = (provider, callback) => {
    let event = (new Interface(BountyFactory.abi)).events.logBountyCreated
    let recurringEvent = (new Interface(RecurringBountyFactory.abi)).events.logRecurringBountyCreated
    provider.on({
      topics: [event.topic]
    }, raw => {
       callback(event.decode(raw.data, raw.topics))
    })

    provider.on({
      topics: [recurringEvent.topic]
    }, raw => {
      callback(recurringEvent.decode(raw.data, raw.topics))
    })
}


export const onBountyAccepted = (provider, callback) => {
  let event = (new Interface(BountyFactory.abi)).events.logBountyAccepted
  let recurringEvent = (new Interface(RecurringBountyFactory.abi)).events.logRecurringBountyAccepted
  provider.on({
    topics: [event.topic]
  }, raw => {
     callback(event.decode(raw.data, raw.topics))
  })

  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    callback(recurringEvent.decode(raw.data, raw.topics))
  })
}

export const onBountyCommit = (provider, callback) => {
  let event = (new Interface(BountyFactory.abi)).events.logCommit
  let recurringEvent = (new Interface(RecurringBountyFactory.abi)).events.logRecurringCommit
  provider.on({
    topics: [event.topic]
  }, raw => {
     callback(event.decode(raw.data, raw.topics))
  })

  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    callback(recurringEvent.decode(raw.data, raw.topics))
  })
}
