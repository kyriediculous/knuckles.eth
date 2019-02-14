import bip39 from 'bip39'
import {
  Wallet
} from 'ethers'
import {
  classToPlain,
  plainToClass
} from 'class-transformer'
import 'reflect-metadata'
import LF from 'localforage'
import {AES, enc} from 'crypto-js'

class KnucklesWallet {
  static async create(password = null) {
    try {
      const knucklesWallet = new KnucklesWallet()
      const mnemonic = bip39.generateMnemonic()
      knucklesWallet.wallet = Wallet.fromMnemonic(mnemonic, `m/99'/66'/0'/0/0`)
      await knucklesWallet.saveWallet(password)
      return knucklesWallet
    } catch (err) {
      throw new Error(err)
    }
  }

  static async restore (mnemonic, password) {
    try {
      const knucklesWallet = new KnucklesWallet()
      knucklesWallet.wallet = Wallet.fromMnemonic(mnemonic, `m/99'/66'/0'/0/0`)
      await knucklesWallet.saveWallet(password)
      return knucklesWallet
    } catch (err) {
      throw new Error(err)
    }
  }

 static fromMnemonic (mnemonic) {
   return Wallet.fromMnemonic(mnemonic, `m/99'/66'/0'/0/0`)
 }

  static exists() {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await LF.getItem(`m/99'/66'/0'/0/0`)
        if (res) {
          resolve('password')
        } else {
          resolve(false)
        }
      } catch (err) {
        reject(new Error(err))
      }
    })
  }

  saveWallet(password) {
    return new Promise(async (resolve, reject) => {
      try {
        //Options to change the speed (this is linear with security)!!!!
        let options = {
          scrypt: {
            N: (1 << 16)
          }
        }
        const encrypted = await this.wallet.encrypt(password, options)
        await LF.setItem(`m/99'/66'/0'/0/0`, encrypted)
        resolve(true)
      } catch (e) {
        reject(new Error(e))
      }
    })
  }

  static getWallet(password) {
    return new Promise(async (resolve, reject) => {
      try {
        const secretStorage = await LF.getItem(`m/99'/66'/0'/0/0`)
        if (!secretStorage.startsWith('{"address":')) {
          const bytes = await AES.decrypt(secretStorage.toString(), password)
          const plain = await bytes.toString(enc.Utf8)
          resolve(await KnucklesWallet.restore(plain, password))
        }
        if (secretStorage ) {
          resolve(await Wallet.fromEncryptedJson(secretStorage, password))
        }
      } catch (e) {
        reject(new Error(e.message))
      }
    })
  }

  toJSON() {
    return classToPlain(this)
  }

  static fromJSON(json) {
    return plainToClass(KnucklesWallet, json)
  }

  mnemonic() {
    return this.wallet.mnemonic
  }
}


export default KnucklesWallet


/*
const createWallet = async () => {
  try {
    const mnem = bip39.generateMnemonic()
    await saveMnemonic(mnem)
    return mnem
  } catch (err) {
    throw new Error(err)
  }
}

const recoverWallet = async (mnemonic) => Wallet.fromMnemonic(mnemonic, `m/99'/66'/0'/0/0`)


const exists = () => new Promise((resolve, reject) => {
  window.plugins.touchid.has(`m/99'/66'/0'/0/0`,
    _ => resolve(true),
    _ => resolve(false)
  )
})

const saveMnemonic = (mnem) => new Promise((resolve, reject) => {
  window.plugins.touchid.save(`m/99'/66'/0'/0/0`, mnem,
  () => {
    resolve(true)
  },
  (err) => {
    reject(new Error(err))
  })
})

const getWallet = () => new Promise((resolve, reject) => {
  window.plugins.touchid.verify(`m/99'/66'/0'/0/0`, "Please use your fingerprint to log in",
  async mnem => resolve(await recoverWallet(mnem)),
  err => reject(new Error(err))
  )
})
*/
