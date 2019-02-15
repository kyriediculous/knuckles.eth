// overwrite the existing bounty factory and bounty master contract
// There was a bug in cancelmintable that allowed anyone to cancel a minted bounty and transfer the reward to themselves.

// !!! TEST THIS ON DEV FIRST AND SEE IF NOTHING BREAKS
// truffle migrate -f 5 --to 5 --network development

const BountyContract = artifacts.require('BountyContract')
const BountyFactory = artifacts.require('BountyFactory')
const RecurringBountyContract = artifacts.require('RecurringBountyContract')
const RecurringBountyFactory = artifacts.require('RecurringBountyFactory')
const OrganisationContract = artifacts.require('OrganisationContract')
const UsersRegistry = artifacts.require('UsersRegistry')

const ethers = require('ethers')

function stringToBytes32(text) {
    let result = ethers.utils.toUtf8Bytes(text)
    if (result.length > 32) { throw new Error('String too long') }
    result = ethers.utils.hexlify(result);
    while (result.length < 66) { result += '0'; }
    if (result.length !== 66) { throw new Error("invalid web3 implicit bytes32"); }
    return result;
}

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const organisation = await OrganisationContract.deployed()
    const users = await UsersRegistry.deployed()
    //remove old token access
    const oldBountyFactory = await BountyFactory.deployed()
    await organisation.changeTokenAccess(oldBountyFactory.address)

    await organisation.removeContract(oldBountyFactory.address)

    const organisationIdentity = await users.get(organisation.address)
    const newBountyFactory = await deployer.deploy(BountyFactory, organisation.address, stringToBytes32(("Design is Dead").toLowerCase()), organisationIdentity)
    //let setter = await organisation.setOrganisationIdentity(stringToBytes32(("Design is Dead").toLowerCase()), '0x' +  organisationIdentity)

    //register new contracts
    //grant new factory access
    await Promise.all([
      organisation.addContract(stringToBytes32("bounty-factory"), newBountyFactory.address),
      organisation.changeTokenAccess(newBountyFactory.address)
    ])

    const oldRbf = await RecurringBountyFactory.deployed()
    await organisation.changeTokenAccess(oldRbf.address)
    await organisation.removeContract(oldRbf.address)

    const newRbf = await deployer.deploy(RecurringBountyFactory, organisation.address, stringToBytes32(("Design is Dead").toLowerCase()), organisationIdentity)

    await Promise.all([
      organisation.addContract(stringToBytes32("recurring-factory"), newRbf.address),
      organisation.changeTokenAccess(newRbf.address)
    ])

  })
}
