const HDWalletProvider = require('truffle-hdwallet-provider')

module.exports = {
  networks: {
    ganache: {
      host: "localhost",
      port: 7545,
      network_id: "*"
    },
    development: {
      provider: _ => new HDWalletProvider('lava kid panther inject erode hero intact siege student ensure install forest', "http://localhost:8545"),
      gasPrice: '0',
      network_id: '6660001',
      gasLimit: 8000000
    },
    knuckles: {
      provider: _ => new HDWalletProvider('lava kid panther inject erode hero intact siege student ensure install forest', 'https://knuckle-node.designisdead.com:443'),
      gasPrice: '0',
      network_id: '*'
    }
  },
  compilers: {
    solc: {
      version: '^0.4.23',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
};
