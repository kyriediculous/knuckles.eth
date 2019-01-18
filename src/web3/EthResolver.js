import {Wallet} from 'ethers'
import Provider from './Provider'
import ContractProvider from './ContractProvider'


import * as UsersResolver from './resolvers/UsersResolver'
import * as TokenResolver from './resolvers/TokenResolver'
import * as BountiesResolver from './resolvers/BountiesResolver'
import * as RecurringBountiesResolver from './resolvers/RecurringBountiesResolver'
import * as FaucetResolver from './resolvers/FaucetResolver'
import * as RewardsResolver from './resolvers/RewardsResolver'
import * as TimesheetsResolver from './resolvers/TimesheetsResolver'
import * as OrganisationResolver from './resolvers/OrganisationResolver'
/**
* @param {Object} ethKey - object containing the eth keys for the identity
* @param {String} provider - the network to be used (perhaps change this to chainId in the future)
*/

class EthResolver {
  static init(provider = process.env.CLIENT) {
    try {
      const ethResolver = new EthResolver()
      ethResolver.provider = Provider(provider)
      ethResolver.ContractProvider = ContractProvider
      return ethResolver
    } catch (err) {
      throw new Error(err)
    }
  }

  users = {
    get: UsersResolver.get.bind(this),
    register: UsersResolver.register.bind(this),
    update: UsersResolver.update.bind(this),
    lookup: UsersResolver.ensLookup.bind(this),
    isAdmin: UsersResolver.isAdmin.bind(this)
  }

  token = {
    approve: TokenResolver.approveSpend.bind(this),
    getBalance: TokenResolver.getBalance.bind(this),
    send: TokenResolver.sendTokens.bind(this),
    info: TokenResolver.tokenInfo.bind(this),
    address: TokenResolver.address.bind(this)
  }

  bounties = {
    all: BountiesResolver.allBounties.bind(this),
    get: BountiesResolver.getBounty.bind(this),
    meta: BountiesResolver.getMeta.bind(this),
    cancel: BountiesResolver.cancelBounty.bind(this),
    cancelMintable: BountiesResolver.cancelMintable.bind(this),
    create: BountiesResolver.createBounty.bind(this),
    createMintable: BountiesResolver.createMintable.bind(this),
    acceptMintable: BountiesResolver.acceptMintable.bind(this),
    contribute: BountiesResolver.contribute.bind(this),
    refundContribution: BountiesResolver.refundContribution.bind(this),
    submit: BountiesResolver.submitCommit.bind(this),
    accept: BountiesResolver.acceptCommit.bind(this),
    from: BountiesResolver.bountiesFrom.bind(this),
    commitsFrom: BountiesResolver.commitsFrom.bind(this),
    rewardsFor: BountiesResolver.rewardsFor.bind(this),
    getCommit: BountiesResolver.getCommit.bind(this),
    leaderboard: BountiesResolver.leaderboard.bind(this),
    activity: BountiesResolver.bountyActivityFeed.bind(this),
    startWorking: BountiesResolver.startWorking.bind(this)
  }

  recurringBounties = {
    all: RecurringBountiesResolver.allRecurringBounties.bind(this),
    from: RecurringBountiesResolver.recurringBountiesFrom.bind(this),
    create: RecurringBountiesResolver.createRecurringBounty.bind(this),
    createMintable: RecurringBountiesResolver.createMintable.bind(this),
    get: RecurringBountiesResolver.getRecurringBounty.bind(this),
    meta: RecurringBountiesResolver.getRecurringBountyMeta.bind(this),
    cancel: RecurringBountiesResolver.cancelRecurringBounty.bind(this),
    cancelMintable: RecurringBountiesResolver.cancelMintable.bind(this),
    accept: BountiesResolver.acceptCommit.bind(this),
    acceptMintable: RecurringBountiesResolver.acceptMintable.bind(this),
    commit: BountiesResolver.submitCommit.bind(this),
    startWorking: RecurringBountiesResolver.startWorking.bind(this),
    getCommit: RecurringBountiesResolver.getCommit.bind(this),
    commits: RecurringBountiesResolver.getCommits.bind(this),
    commitsFrom: RecurringBountiesResolver.commitsFrom.bind(this),
    rewardsFor: RecurringBountiesResolver.rewardsFor.bind(this),
    withdrawFunding: RecurringBountiesResolver.withdrawFunding.bind(this),
    addFunding: RecurringBountiesResolver.addFunding.bind(this),
    mintFunding: RecurringBountiesResolver.mintFunding.bind(this),
    activity: RecurringBountiesResolver.bountyActivityFeed.bind(this),
    leaderboard: RecurringBountiesResolver.leaderboard.bind(this)
  }

  faucet = {
    limit: FaucetResolver.currentLimit.bind(this),
    setLimit: FaucetResolver.setLimit.bind(this),
    faucet: FaucetResolver.faucet.bind(this),
    received: FaucetResolver.received.bind(this),
    all: FaucetResolver.allFaucets.bind(this)
  }

  rewards = {
    add: RewardsResolver.add.bind(this),
    remove: RewardsResolver.remove.bind(this),
    get: RewardsResolver.get.bind(this),
    update: RewardsResolver.update.bind(this),
    all: RewardsResolver.getAll.bind(this),
    purchase: RewardsResolver.purchase.bind(this),
    changeStatus: RewardsResolver.changeStatus.bind(this)
  }

  timesheets = {
    setReward: TimesheetsResolver.setReward.bind(this),
    setPeriod: TimesheetsResolver.setPeriod.bind(this),
    timesheet: TimesheetsResolver.timesheet.bind(this),
    reward: TimesheetsResolver.reward.bind(this),
    last: TimesheetsResolver.getLast.bind(this),
    rewards: TimesheetsResolver.timesheetRewards.bind(this)
  }

  organisation = {
    identity: OrganisationResolver.setIdentity.bind(this),
    mint: OrganisationResolver.mintTokens.bind(this),
    addAdmin: OrganisationResolver.addAdmin.bind(this),
    removeAdmin: OrganisationResolver.removeAdmin.bind(this),
    blacklist: OrganisationResolver.blacklist.bind(this),
    whitelist: OrganisationResolver.whitelist.bind(this),
    admins: OrganisationResolver.admins.bind(this),
    currentBlacklist: OrganisationResolver.currentBlacklist.bind(this),
    members: OrganisationResolver.members.bind(this),
    requireApproval: OrganisationResolver.requireApproval.bind(this),
    pending: OrganisationResolver.pending.bind(this),
    approve: OrganisationResolver.approve.bind(this),
    toggleApproval: OrganisationResolver.toggleApproval.bind(this),
    isPending: OrganisationResolver.isPending.bind(this)
  }
}


export default EthResolver
