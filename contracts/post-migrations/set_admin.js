const OrganisationContract = artifacts.require('OrganisationContract')

module.exports = async (err) => {
  try {
    const organisation = await OrganisationContract.deployed()
    await organisation.addAdmin(process.env.ADDRESS, {gasPrice: 0})
    console.log("Admin added: ", process.env.ADDRESS)
    return process.exit(1)
  } catch (err) {
    console.error("Something went wrong: ", error)
    process.exit(0)
  }
}


// TODO should remove admin set by truffleProvider on migration
