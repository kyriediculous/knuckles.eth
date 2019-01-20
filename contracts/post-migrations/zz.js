const ethers = require('ethers')
const bip39 = require('bip39')
const adminWallet = ethers.Wallet.fromMnemonic(bip39.generateMnemonic(),  `m/99'/66'/0'/0/0`)

adminWallet.encrypt("test").then(e => ethers.Wallet.fromEncryptedWallet(e, "test")).then(w => console.log(w)).catch(err => console.log(err))
