const BountyContract = artifacts.require('BountyContract')
const Token = artifacts.require('Token')
const BountyProxy = artifacts.require('BountyProxy')
const BountyInterface = artifacts.require('BountyInterface')
const OrganisationContract = artifacts.require('OrganisationContract')
const UsersRegistry = artifacts.require('UsersRegistry')
const Timesheets = artifacts.require('Timesheets')
const RewardStore = artifacts.require('RewardStore')
const TokenFaucet = artifacts.require('TokenFaucet')
const BountyFactory = artifacts.require('BountyFactory')
const Swarm = require('@erebos/swarm')
const clients = {
  dev: "http://localhost:8500",
  prod: "https://knuckle-swarm.designisdead.com"
}

if (process.env.CLIENT == undefined ) {
  throw new Error("Supply a client as env variable. 'prod' or 'dev'")
  process.exit(0)
}
const client = new Swarm.SwarmClient({bzz: {url: clients[process.env.CLIENT]}})
console.log("swarm initiated")
const ethers = require('ethers')

var fs = require('fs');
var path = require('path')

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file, {encoding: 'base64'});
    // convert binary data to base64 encoded string
    return "data:image/*;base64," + bitmap
}

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

    // Deploy master bounty contract
    const bountyContract = await deployer.deploy(BountyContract)
    // Deploy the users registry
    const users = await deployer.deploy(UsersRegistry)
    // Deploy Knuckles token
    const token = await deployer.deploy(Token, "Knuckles", "KNCKL", 18)
    // Deploy a blank organisation
    // The transaction sender will be initialized as administrator
    const organisation = await deployer.deploy(OrganisationContract)

    // Upload organisation identity to swarm
    const organisationIdentity = await client.bzz.upload(
      JSON.stringify(
        {
          name: "design is dead",
          email: "info@designisdead.com",
          bio: "The best digital agency in the world!",
          avatar: base64_encode(path.resolve(__dirname, 'knuckles-logo.png'))
        }
      ),
      {contentType: "application/json"}
    )

    await Promise.all([
      organisation.addContract(stringToBytes32("bounty"), bountyContract.address),
      organisation.addContract(stringToBytes32("token"), token.address),
      organisation.addContract(stringToBytes32("users"), users.address)
    ])
    //Deploy the modules
    const timesheets = await deployer.deploy(Timesheets, organisation.address)
    const rewards = await deployer.deploy(RewardStore, organisation.address)
    const faucet = await deployer.deploy(TokenFaucet, organisation.address)
    const bountyFactory = await deployer.deploy(BountyFactory, organisation.address, stringToBytes32(("Design is Dead").toLowerCase()), '0x' + organisationIdentity)

    //Register the contracts used by the organisation
    await Promise.all([
      organisation.addContract(stringToBytes32("timesheets"), timesheets.address),
      organisation.addContract(stringToBytes32("rewards"), rewards.address),
      organisation.addContract(stringToBytes32("faucet"), faucet.address),
      organisation.addContract(stringToBytes32("bounty-factory"), bountyFactory.address),
      organisation.changeTokenAccess(timesheets.address),
      organisation.changeTokenAccess(faucet.address),
      organisation.changeTokenAccess(bountyFactory.address)
    ])

    // We now have a hash reference to put on chain
    // Register the organisation identity
    let setter = await organisation.setOrganisationIdentity(stringToBytes32(("Design is Dead").toLowerCase()), '0x' +  organisationIdentity)

    // Transfer the token ownership to the organisation contract
    // The token will be managed from there
    await token.transferOwnership(organisation.address)

    //Set faucet limit
    await faucet.setLimit("50000000000000000000")

    //set Timesheet reward
    await timesheets.setReward("5000000000000000000")

    // If this admin account wants to post bounties to the organisation
    // He will still need to register
    // And join the organisation


  })
}
