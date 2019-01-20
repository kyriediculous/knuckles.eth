const ethers = require('ethers')
const bip39 = require('bip39')
const Swarm = require('@erebos/swarm-node')
const client = new Swarm.SwarmClient({bzz: 'http://localhost:8500'})
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545',  {name: 'development', chainId: 6660001})

const Token = require('../build/contracts/Token.json')
const UsersRegistry = require('../build/contracts/UsersRegistry.json')
const Organisation = require('../build/contracts/OrganisationContract.json')
const Faucet = require('../build/contracts/TokenFaucet.json')
const BF = require('../build/contracts/BountyFactory.json')
const RBF = require('../build/contracts/RecurringBountyFactory.json')
const Bounty = require('../build/contracts/BountyInterface.json')
const RBounty = require('../build/contracts/RecurringBountyInterface.json')
const Timesheets = require('../build/contracts/Timesheets.json')

//import 150 mock profiles
let profiles = require('./mock_profiles.json')
let bounties = require('./mock_bounties.json')
let commits = require('./mock_commits.json')

let dates = [
  "Jan 16, 2019",
  "Jan 23, 2019",
  "Jan 30, 2019",
  "Feb 5, 2019",
  "Feb 12, 2019",
  "Feb 19, 2019",
  "Feb 26, 2019",
  "Mar 5, 2019"
].map(d => Date.parse(d)/1000)

function stringToBytes32(text) {
    let result = ethers.utils.toUtf8Bytes(text)
    if (result.length > 32) { throw new Error('String too long') }
    result = ethers.utils.hexlify(result);
    while (result.length < 66) { result += '0'; }
    if (result.length !== 66) { throw new Error("invalid web3 implicit bytes32"); }
    return result;
}

function randomIndex(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

const adminWallet = ethers.Wallet.fromMnemonic('furnace doctor balcony photo domain frame nut liar frozen loop engine fetch',  `m/99'/66'/0'/0/0`)
adminWallet.provider = provider

const mockeroo = async () => {
  try {

    //set faucet limit quite high
    let faucet = new ethers.Contract(Faucet.networks[provider.chainId].address, Faucet.abi, adminWallet)
    await faucet.setLimit(ethers.utils.parseEther("9999999"))

    console.info("[COMPLETED] Faucet limit set to mocking levels")

    //create 150 wallets
    profiles = profiles.map(p => {
      p.wallet = ethers.Wallet.fromMnemonic(bip39.generateMnemonic(), `m/99'/66'/0'/0/0`)
      p.wallet.provider = provider
      return p
    })
    console.info("[COMPLETED] Generated 150 wallets")

    //create 150 profiles
    const hashes = await Promise.all(profiles.map(p => client.bzz.upload(
      JSON.stringify({
        name: p.name,
        bio: p.bio,
        email: p.email,
        avatar: p.avatar
      }),
      {contentType: "application/json"}
    )))

    profiles = profiles.map((p, i) => {
      p.swarm = hashes[i]
      return p
    })
    console.info("[COMPLETED] Generated 150 profiles")
    //register all profiles on chain

    let txs = await Promise.all(profiles.map(p => {
      let users = new ethers.Contract(UsersRegistry.networks[provider.chainId].address, UsersRegistry.abi, p.wallet)
      return users.register(stringToBytes32(p.name.toLowerCase()), '0x' + p.swarm, {gasPrice: '0x0'})
    }))
    txs = await Promise.all(txs.map(tx => provider.waitForTransaction(tx.hash)))
    console.info("[COMPLETED] Registered all 150 profiles on chain")
    //Make all profiles join the organisation
    txs = await Promise.all(profiles.map(p => {
      let org = new ethers.Contract(Organisation.networks[provider.chainId].address, Organisation.abi, p.wallet)
      return org.join()
    }))
    txs = await Promise.all(txs.map(tx => provider.waitForTransaction(tx.hash)))
    console.info("[COMPLETED] All 150 profiles joined the organisation")
    //Give all profiles some knuckles
    txs = await Promise.all(profiles.map(p => {
      let faucet = new ethers.Contract(Faucet.networks[provider.chainId].address, Faucet.abi, p.wallet)
      return faucet.faucet()
    }))
    txs = await Promise.all(txs.map(tx => provider.waitForTransaction(tx.hash)))
    console.info("[COMPLETED] All 150 profiles received a bunch of tokens")

    //Parse all bounties to correct datatypes
    bounties = bounties.map(b => {
      return {
        type: '',
        title: b.title,
        description: b.description,
        reward: ethers.utils.parseEther(b.reward.toString()),
        funding: ethers.utils.parseEther(b.reward.toString()),
        deadline: Date.parse(b.deadline) / 1000,
        attachments: [],
        tags: b.tags
      }
    })

    //Create 20 Mintable 'Single' bounties
    let blockNumber = await provider.getBlockNumber()
    let bf = new ethers.Contract(BF.networks[provider.chainId].address, BF.abi, adminWallet)
    for (i = 0; i < 20; i++) {
      let ref = '0x' + await client.bzz.upload(JSON.stringify(bounties[i]), {contentType: "application/json"})
      let tx = await bf.createMintableBounty(ref, bounties[i].deadline, bounties[i].reward)
      await provider.waitForTransaction(tx.hash)
    }
    let event = bf.interface.events.logBountyCreated
    let logs = await provider.getLogs({
      fromBlock: blockNumber,
      toBlock: 'latest',
      address: bf.address,
      topics: [event.topics[0]]
    })
    logs = logs.map(log => event.parse(log.topics, log.data))
    const singlesAdmin = logs.map(log => log.bounty)
    console.info("[COMPLETED] Created 20 single type minted bounties")

    //create 20 mintable recurring bounties
    blockNumber = await provider.getBlockNumber()
    let rbf = new ethers.Contract(RBF.networks[provider.chainId].address, RBF.abi, adminWallet)
    for (i = 20; i < 40; i++) {
      let ref = '0x' + await client.bzz.upload(JSON.stringify(bounties[i]), {contentType: "application/json"})
      let tx = await rbf.createMintableBounty(ref, bounties[i].deadline, bounties[i].reward, bounties[i].funding)
      await provider.waitForTransaction(tx.hash)
    }
    event = rbf.interface.events.logRecurringBountyCreated
    logs = await provider.getLogs({
      fromBlock: blockNumber,
      toBlock: 'latest',
      address: rbf.address,
      topics: [event.topics[0]]
    })
    logs = logs.map(log => event.parse(log.topics, log.data))
    const recurringAdmin = logs.map(log => log.bounty)
    console.info("[COMPLETED] Created 20 recurring type minted bounties")


    //create 30 single bounties
    blockNumber = await provider.getBlockNumber()
    for (i = 0; i < 30; i ++) {
       bf = new ethers.Contract(BF.networks[provider.chainId].address, BF.abi, profiles[i].wallet)
       let ref = '0x' + await client.bzz.upload(JSON.stringify(bounties[i+40]), {contentType: "application/json"})
       let token = new ethers.Contract(Token.networks[provider.chainId].address, Token.abi, profiles[i].wallet)
       let tx = await token.approve(bf.address, bounties[i+40].reward)
       await provider.waitForTransaction(tx.hash)
       tx = await bf.createBounty(ref, bounties[i+40].deadline, bounties[i+40].reward)
       await provider.waitForTransaction(tx.hash)
    }
    //Get block number to not duplicate the mintable bounties

    event = bf.interface.events.logBountyCreated
    logs = await provider.getLogs({
      fromBlock: blockNumber,
      toBlock: 'latest',
      address: bf.address,
      topics: [event.topics[0]]
    })
    logs = logs.map(log => event.parse(log.topics, log.data))
    const singles = logs.map(log => log.bounty)
    console.info("[COMPLETED] Created 30 single type normal bounties")

    //create 30 recurring bounties
    blockNumber = await provider.getBlockNumber()
    for (i=30; i<60; i++) {
      rbf = new ethers.Contract(RBF.networks[provider.chainId].address, RBF.abi, profiles[i].wallet)
      let token = new ethers.Contract(Token.networks[provider.chainId].address, Token.abi, profiles[i].wallet)
      let ref = '0x' + await client.bzz.upload(JSON.stringify(bounties[i+40]), {contentType: "application/json"})
      let tx = await token.approve(bf.address, bounties[i+40].reward)
      await provider.waitForTransaction(tx.hash)
      tx = await rbf.createBounty(ref, bounties[i+40].deadline, bounties[i+40].reward, bounties[i+40].funding)
      await provider.waitForTransaction(tx.hash)
    }
    event = rbf.interface.events.logRecurringBountyCreated
    logs = await provider.getLogs({
      fromBlock: blockNumber,
      toBlock: 'latest',
      address: rbf.address,
      topics: [event.topics[0]]
    })
    logs = logs.map(log => event.parse(log.topics, log.data))
    const recurring = logs.map(log => log.bounty)
    console.info("[COMPLETED] Created 30 recurring type normal bounties", logs)

    console.log(singlesAdmin)
    console.log(recurringAdmin)
    console.log(singles)
    console.log(recurring)

    //create commits
    await Promise.all(singlesAdmin.map( (b, i) => {
      let set = randomIndex(0, profiles.length-21)
      console.log(set, set+20)
      return Promise.all(profiles.slice(set, set+20).map(async p => {
        let bounty = new ethers.Contract(b, Bounty.abi, p.wallet)
        let ref = '0x' + await client.bzz.upload(JSON.stringify(commits[randomIndex(0, commits.length-1)]), {contentType: "application/json"})
        return bounty.submitCommit(ref)
      }))
    }))
    console.info("[COMPLETED] Created 20 commits on each single type minted bounty")

    await Promise.all(recurringAdmin.map( (b, i) => {
      let set = randomIndex(0, profiles.length-21)
      return Promise.all(profiles.slice(set, set+20).map(async p => {
        let bounty = new ethers.Contract(b, RBounty.abi, p.wallet)
        let ref = '0x' + await client.bzz.upload(JSON.stringify(commits[randomIndex(0, commits.length-1)]), {contentType: "application/json"})
        return bounty.submitCommit(ref)
      }))
    }))
    console.info("[COMPLETED] Created 20 commits on each recurring type minted bounty")

    await Promise.all(singles.map( (b, i) => {
      let set = randomIndex(0, profiles.length-21)
      return Promise.all(profiles.slice(set, set+20).map(async p => {
        let bounty = new ethers.Contract(b, Bounty.abi, p.wallet)
        let ref = '0x' + await client.bzz.upload(JSON.stringify(commits[randomIndex(0, commits.length-1)]), {contentType: "application/json"})
        return bounty.submitCommit(ref)
      }))
    }))
    console.info("[COMPLETED] Created 20 commits on each single type normal bounty")

    await Promise.all(recurring.map( (b, i) => {
      let set = randomIndex(0, profiles.length-21)
      return Promise.all(profiles.slice(set, set+20).map(async p => {
        let bounty = new ethers.Contract(b, RBounty.abi, p.wallet)
        let ref = '0x' + await client.bzz.upload(JSON.stringify(commits[randomIndex(0, commits.length-1)]), {contentType: "application/json"})
        return bounty.submitCommit(ref)
      }))
    }))
    console.info("[COMPLETED] Created 20 commits on each recurring type minted bounty")


    //accept commits
    bf = new ethers.Contract(BF.networks[provider.chainId].address, BF.abi, adminWallet)
    await Promise.all(singlesAdmin.map(b => {
      return bf.acceptMintable(b, randomIndex(0, 19))
    }))
    console.info("[COMPLETED] Accepted a commit on the singles minted bounties")

    await Promise.all(profiles.slice(0, 30).map((p, i) => {
      let bounty = new ethers.Contract(singles[i], Bounty.abi, p.wallet)
      return bounty.acceptCommit(randomIndex(0, 19))
    }))
    console.info("[COMPLETED] Accepted a commit on the singles normal bounties")

    rbf = new ethers.Contract(RBF.networks[provider.chainId].address, RBF.abi, adminWallet)
    await Promise.all(recurringAdmin.map(b => rbf.acceptMintable(b, randomIndex(0, 9))))
    await Promise.all(recurringAdmin.map(b => rbf.acceptMintable(b, randomIndex(9, 19))))
    console.info("[COMPLETED] Accepted two commits on the recurring minted bounties")

    await Promise.all(profiles.slice(30, 60).map( (p,i) => {
      let bounty = new ethers.Contract(recurring[i], RBounty.abi, p.wallet)
      return Promise.all([
        bounty.acceptCommit(randomIndex(0, 9)),
        bounty.acceptCommit(randomIndex(9, 19)),
      ])
    }))
    console.info("[COMPLETED] Accepted two commits on the recurring normal bounties")

    //do timesheets
    const ts = new ethers.Contract(Timesheets.networks[provider.chainId].address, Timesheets.abi, adminWallet)
    await Promise.all(profiles.map(p => {
      return Promise.all(dates.map(d => ts.setPeriod(p.wallet.address, d, true)))
    }))
    console.info("[COMPLETED] Added some timesheet rewards for everyone\n")

    console.info("Mock Data has been entered, you can now check all the thing you broke in the browser!")

    return process.exit(1)
  } catch (err) {
    console.error("Something went wrong: ", err)
    process.exit(0)
  }
}

mockeroo()
