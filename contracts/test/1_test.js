const BountyContract = artifacts.require('BountyContract')
const Token = artifacts.require('Token')
const BountyProxy = artifacts.require('BountyProxy')
const BountyInterface = artifacts.require('BountyInterface')
const OrganisationContract = artifacts.require('OrganisationContract')
const UsersRegistry = artifacts.require('UsersRegistry')
const Timesheets = artifacts.require('Timesheets')
const BountyFactory = artifacts.require('BountyFactory')
const Faucet = artifacts.require('TokenFaucet')
const RewardStore = artifacts.require('RewardStore')
const utils = require('ethers').utils

const RecurringBountyContract = artifacts.require('RecurringBountyContract')
const RecurringBountyFactory = artifacts.require('RecurringBountyFactory')
const RecurringBountyInterface = artifacts.require('RecurringBountyInterface')
// TODO
// Timesheets test

function stringToBytes32(text) {
    let result = utils.toUtf8Bytes(text)
    if (result.length > 32) { throw new Error('String too long') }
    result = utils.hexlify(result);
    while (result.length < 66) { result += '0'; }
    if (result.length !== 66) { throw new Error("invalid web3 implicit bytes32"); }
    return result;
}

const example1 = {
  reference: stringToBytes32("TheFirstOne123"),
  deadline: 1545403163714,
  reward: 10000000
}

const example2 = {
  reference: stringToBytes32("TheSecondOne456"),
  deadline: 1545403163714,
  reward: 50000000
}

const example3 = {
  reference: stringToBytes32("TheFourthOne"),
  deadline: 1545403163714,
  reward: 80000000
}

const assertRevert = async promise => {
  try {
    await promise
    assert.fail('Expected error not received')
  } catch (error) {
    const rev = error.message.search('revert') >= 0
    assert(rev, `Expected "revert", got ${error.message} instead`)
  }
}

contract("Concurrency benchmark", async() => {
  it("deploys in parallel", async () => {
    let start = Date.now()
    await deployParallel()
    let end = Date.now()
    console.log("Time to deploy in parallel", end-start, "ms")
  })
})


contract('Organisation', async accounts => {
  let _impl, organisation, users, token, timesheets, rewards, faucet, bountyFactory, deployed, modules
  const faucetLimit = "1000000"
  before(async () => {
    ({deployed, modules} = await deployParallel())
    _impl = deployed[0]
    token = deployed[1]
    users = deployed[2]
    organisation= deployed[3]

    timesheets = modules[0]
    rewards = modules[1]
    faucet = modules[2]
    bountyFactory = modules[3]
  })

  it("Should have deployed a new organisation", async () => {
    await users.register(stringToBytes32("John DoeDoe"), stringToBytes32("swarmprofile"))
    await organisation.join()
    await token.transferOwnership(organisation.address)
    await organisation.mintToken(accounts[0], "1000000000")
    assert.equal(await token.owner(), organisation.address)
    assert.equal(await organisation.contracts(stringToBytes32("users")), users.address)
    assert.equal(await organisation.admins(accounts[0]), true)
    assert.equal(await token.balanceOf(accounts[0]),  "1000000000")
  })

  it("Should have set the faucet limit", async () => {
    await faucet.setLimit(faucetLimit)
    assert.equal((await faucet.faucetLimit()).toString(10), faucetLimit)
  })


  it("Should let a registered user join an organisation", async () => {
    await users.register(stringToBytes32("John Doe"), stringToBytes32("swarmprofile"), {from: accounts[2]})
    await organisation.join({from: accounts[2]})
    await faucet.faucet({from: accounts[2]})
    assert.equal(await organisation.members(accounts[2]), true)
    assert.equal((await token.balanceOf(accounts[2])).toString(10), faucetLimit)
  })

  it("Should not let a user faucet twice", async () => {
    await assertRevert(faucet.faucet({from: accounts[2]}))
  })

  it("should not let an unregistered user join an organisation", async () => {
    await assertRevert(organisation.join({from: accounts[3]}))
  })

  it("Should not let an unregistered user faucet", async () => {
    await assertRevert(faucet.faucet({from: accounts[3]}))
  })

  it("Should let an admin add a rewardstore listing", async () => {
    let reference = stringToBytes32("Hello Store")
    let price = "5000"
    await rewards.addListing(reference, price)
    let listing = await rewards.listings(0)
    assert.equal(listing[1].toString(10), price)
    assert.equal(listing[0], reference)
  })

  it("should not let a random create a listing", async () => {
    let reference = stringToBytes32("Hello Store")
    let price = "5000"
    await assertRevert(rewards.addListing(reference, price, {from: accounts[3]}))
  })

  it("should let me purchase a listing when I have enough tokens", async () => {
    await token.approve(rewards.address, "5000")
    let tx = await rewards.purchase(0)
    assert.equal(tx.logs[0].args._price.toString(10), "5000")
    assert.equal(tx.logs[0].args._reference, stringToBytes32("Hello Store"))
  })

  it("Should throw when buying a listing without having sufficient balance", async () => {
    await assertRevert(rewards.purchase(0, {from: accounts[3]}))
  })

  it("Should let an admin process a timesheet", async () => {
    let tx = await timesheets.setPeriod(accounts[0], Date.now().toString(), true)
    console.log(tx.logs)
    assert.equal(tx.logs[0].args._completed, true)
  })

  it("Should throw when a random tries to process a timesheet", async () => {
    await assertRevert(timesheets.setPeriod(Date.now().toString(), accounts[1], true, {from: accounts[3]}))
  })
})


/*

contract('BountyProxy', async accounts => {
  let _impl, proxy, token, users, organisation
  let bounty1, bounty2, bounty3

  before(async () => {
      _impl = (await BountyContract.new()).address
      token = await Token.new("Token", "TKN", 18)
      users = await UsersRegistry.new()
      organisation = await OrganisationContract.new()
      await organisation.addContract(stringToBytes32("bounty"), _impl)
      await organisation.addContract(stringToBytes32("token"), token.address)
      await organisation.addContract(stringToBytes32("users"), users.address)
      await token.transferOwnership(organisation.address)
      await organisation.mintToken(accounts[0], 2000000000)
  })

  it("Should have deployed a new organisation", async () => {
    assert.equal(await token.owner(), organisation.address)
    assert.equal(await organisation.contracts(stringToBytes32("users")), users.address)
    assert.equal(await organisation.admins(accounts[0]), true)
  })

  it("Should create the first MINTABLE bounty", async () => {
    let tx = await organisation.createMintableBounty(example1.reference, example1.deadline, example1.reward)
    let bountyAddress = tx.logs[0].args.bounty
    bounty1 = await BountyInterface.at(bountyAddress)
    let res1 = await bounty1.getBounty()
    assert.equal(example1.reference, res1[0])
    // test that events emitted by a bounty instance where address(this)
    // is indexed to search for events per bounty does not equal the address of the master contract
    tx = await bounty1.startWork()
    assert.notEqual(tx.logs[0].args._bounty, _impl)
  })

  it("Should create the second bounty", async () => {
    let tx = await organisation.createMintableBounty(example2.reference, example2.deadline, example2.reward)
    let bountyAddress = tx.logs[0].args.bounty
    bounty2 = await BountyInterface.at(bountyAddress)
    let res2 = await bounty2.getBounty()
    assert.equal(example2.reference, res2[0])
    //check that bounty1 hasn't been overwritten with this proxy-master approach
    let res1 = await bounty1.getBounty()
    assert.notEqual(res2[0], res1[0])
  })

  it("Should create the third MINTABLE bounty", async () => {
    let tx = await organisation.createMintableBounty(example3.reference, example3.deadline, example3.reward)
    bounty3 = await BountyInterface.at(tx.logs[0].args.bounty)
  })

  it("Should not let a nonAdmin make a mintable bounty", async () => {
    await assertRevert(organisation.createMintableBounty(example2.reference, example2.deadline, example2.reward, {from: accounts[1]}))
  })

  it("Should not let someone create a reward without enough tokens", async () => {
    await assertRevert(organisation.createBounty(example3.reference, example3.deadline, example3.reward, {from: accounts[1]}))
  })

  it("Should let someone create a commit and log that", async () => {
    let tx = await bounty1.submitCommit(stringToBytes32("commit1111"), {from: accounts[1]})
    assert.equal(tx.logs[0].args._by, accounts[1])
    assert.equal(tx.logs[0].args._id, (await bounty1.getCommits()) -1)
    assert.equal(tx.logs[0].args._bounty, bounty1.address)
  })

  it("Should let an admin accept the commit for the MINTABLE bounty and log that", async () => {
    let tx = await organisation.acceptMintable(bounty1.address, 0)
    //The organisationcontract does not emit the logs but we can find the unparsed logs in the receipt
    // There should be 2 (logAccepted and Transfer)
    assert.equal(tx.receipt.logs.length, 2)
    //The bounty should now be completed (second option in the status enum)
    let res = await bounty1.getBounty()
    assert.equal(res[5], 1)
  })

  it("Should let someone contribute to an active bounty", async () => {
    //Use second bounty and accounts[3]
    // mint 500k to accounts[3]
    // contribute 250k to bounty2
    await organisation.mintToken(accounts[3], 500000)
    await token.approve(bounty2.address, 250000, {from: accounts[3]})
    let tx = await bounty2.contribute(250000, {from: accounts[3]})
    //Is there a log from logContribute?
    assert.notEqual(tx.logs.length, 0)
    assert.equal(tx.logs[0].args._amount, 250000)
    assert.equal(tx.logs[0].args._by, accounts[3])
  })

  it("Should let an admin cancel a MINTABLE bounty", async () => {
    //we still have bounty3 Untouched
    let tx = await organisation.cancelMintable(bounty3.address)
  })

  it("Should let someone create a non mintable bounty", async () => {
    //use accounts 4
    await organisation.mintToken(accounts[4], 500000)
    await token.approve(organisation.address, 250000, {from: accounts[4]})
    await users.register(stringToBytes32("hello world"), stringToBytes32("hello world"), {from: accounts[4]})
    await organisation.join({from: accounts[4]})
    let tx = await organisation.createBounty(example3.reference, example3.deadline, 250000, {from: accounts[4]})
    let myBounty = await BountyInterface.at(tx.logs[0].args.bounty)
    myBounty = await myBounty.getBounty()
    assert.equal(myBounty[1], accounts[4])
  })
})

*/

async function deployParallel () {
  const deployed = await Promise.all([BountyContract.new(), Token.new("Token", "TKN", 18), UsersRegistry.new(), await OrganisationContract.new()])
  const organisation = deployed[3]
  const modules = await Promise.all([Timesheets.new(organisation.address), RewardStore.new(organisation.address), Faucet.new(organisation.address), BountyFactory.new(organisation.address)])
  //register components
  await Promise.all([
    organisation.addContract(stringToBytes32("bounty"), deployed[0].address),
    organisation.addContract(stringToBytes32("token"), deployed[1].address),
    organisation.addContract(stringToBytes32("users"), deployed[2].address)
  ])
  //register features
  await Promise.all([
    organisation.addContract(stringToBytes32("timesheets"), modules[0].address),
    organisation.addContract(stringToBytes32("rewards"), modules[1].address),
    organisation.addContract(stringToBytes32("faucet"), modules[2].address),
    organisation.addContract(stringToBytes32("bounty-factory"), modules[3].address)
  ])
  await Promise.all([
    organisation.changeTokenAccess(modules[0].address),
    organisation.changeTokenAccess(modules[2].address),
    organisation.changeTokenAccess(modules[3].address)
  ])
  return {deployed, modules}
}

async function deploySerial() {
  _impl = (await BountyContract.new()).address
  token = await Token.new("Token", "TKN", 18)
  users = await UsersRegistry.new()
  organisation = await OrganisationContract.new()
  await organisation.addContract(stringToBytes32("bounty"), _impl)
  await organisation.addContract(stringToBytes32("token"), token.address)
  await organisation.addContract(stringToBytes32("users"), users.address)
  return {_impl, token, users, organisation}
}

function getFunctions(abi) {
  let sigs = []
  for(let item of abi) {
    if (item.name && item.name.startsWith('log') == false) {
      let args = item.inputs.map(i => i.type)
       args = args.join(', ')
       sigs.push(`${item.name}(${args})`)
    }
  }
  return sigs
}
