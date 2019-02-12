const HDWalletProvider = require('truffle-hdwallet-provider')

const provider = new HDWalletProvider('lava kid panther inject erode hero intact siege student ensure install forest', "http://localhost:8545")

module.exports = async (err) => {
  try {
    provider.engine.stop()
    console.log("Provider stopped")
    return process.exit(1)
  } catch (err) {
    console.error("Something went wrong: ", error)
    process.exit(0)
  }
}
