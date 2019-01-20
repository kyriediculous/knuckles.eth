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

    const orgIdentity = await users.get(organisation.address)
    const rbc = await deployer.deploy(RecurringBountyContract)
    const rbf = await deployer.deploy(RecurringBountyFactory, organisation.address, stringToBytes32(("Design is Dead").toLowerCase()), orgIdentity)

    organisation.addContract(stringToBytes32("recurring-bounty"), rbc.address)
    organisation.addContract(stringToBytes32("recurring-factory"), rbf.address)
    organisation.changeTokenAccess(rbf.address)


  })
}
