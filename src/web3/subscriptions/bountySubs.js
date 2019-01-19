import {
  Interface
} from 'ethers/utils'

import BountyFactory from '../artifacts/BountyFactory.json'
import RecurringBountyFactory from '../artifacts/RecurringBountyFactory.json'
import BountyInterface from '../artifacts/BountyInterface.json'
import RecurringBountyInterface from '../artifacts/RecurringBountyInterface.json'
import Provider from '../Provider'


export const onBountyCreated = callback => {
  const provider = Provider(process.env.CLIENT)

  let event = (new Interface(BountyFactory.abi)).events.logBountyCreated
  let recurringEvent = (new Interface(RecurringBountyFactory.abi)).events.logRecurringBountyCreated
  provider.on({
    topics: [event.topic]
  }, raw => {
    let decoded = {
      ...event.decode(raw.data, raw.topics),
      type: 'single'
    }
    callback(decoded)
  })

  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    let decoded = {
      ...recurringEvent.decode(raw.data, raw.topics),
      type: 'recurring'
    }
    callback(decoded)
  })
}


export const onBountyAccepted = callback => {
  const provider = Provider(process.env.CLIENT)

  let event = (new Interface(BountyInterface.abi)).events.logAccepted
  let recurringEvent = (new Interface(RecurringBountyInterface.abi)).events.logRecurringAccepted
  provider.on({
    topics: [event.topic]
  }, raw => {
    let decoded = {
      ...event.decode(raw.data, raw.topics),
      type: 'single'
    }
    callback(decoded)
  })

  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    let decoded = {
      ...recurringEvent.decode(raw.data, raw.topics),
      type: 'recurring'
    }
    callback(decoded)
  })
}

export const onBountyCommit = callback => {
  const provider = Provider(process.env.CLIENT)

  let event = (new Interface(BountyInterface.abi)).events.logCommit
  let recurringEvent = (new Interface(RecurringBountyInterface.abi)).events.logRecurringCommit
  provider.on({
    topics: [event.topic]
  }, raw => {
    let decoded = {
      ...event.decode(raw.data, raw.topics),
      type: 'single'
    }
    callback(decoded)
  })

  provider.on({
    topics: [recurringEvent.topic]
  }, raw => {
    let decoded = {
      ...recurringEvent.decode(raw.data, raw.topics),
      type: 'recurring'
    }
    callback(decoded)
  })
}
