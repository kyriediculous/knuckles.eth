import bip39 from 'bip39'
import {
  Wallet
} from 'ethers'
import {
  classToPlain,
  plainToClass,
  Exclude,
  Expose
} from 'class-transformer'
import 'reflect-metadata'
import Credential from './Credential'
import LF from 'localforage'
import {AES, enc} from 'crypto-js'

class KnucklesWallet {
  static async create(password = null) {
    try {
      const knucklesWallet = new KnucklesWallet()
      const mnemonic = bip39.generateMnemonic()
      knucklesWallet.mnemonic = mnemonic
      knucklesWallet.wallet = knucklesWallet.recoverWallet()
      await knucklesWallet.saveMnemonic(password)
      return knucklesWallet
    } catch (err) {
      throw new Error(err)
    }
  }

  static async restore (mnemonic, password) {
    try {
      const knucklesWallet = new KnucklesWallet()
      knucklesWallet.mnemonic = mnemonic
      knucklesWallet.wallet = knucklesWallet.recoverWallet()
      await knucklesWallet.saveMnemonic(password)
      return knucklesWallet
    } catch (err) {
      throw new Error(err)
    }
  }

  static exists() {
    return new Promise(async (resolve, reject) => {
      if (window.plugins) { //CORDOVA
        if (window.plugins.touchid) {
          window.plugins.touchid.has(`m/99'/66'/0'/0/0`,
            _ => resolve("touchid"),
            _ => NativeStorage.getItem(`m/99'/66'/0'/0/0`,
                      res => {if (res) resolve("password")},
                      err => reject(throw new Error(err))
            )
          )
        } else {
          NativeStorage.getItem(`m/99'/66'/0'/0/0`,
            res => resolve("password"),
            err => reject(throw new Error(err))
          )
        }
      } else { //BROWSER
        try {
          const res = await LF.getItem(`m/99'/66'/0'/0/0`)
          if (res) {
            resolve("password")
          } else {
            resolve(false)
          }
        } catch (err) {
          reject(throw new Error(err))
        }
      }
    })
  }

  recoverWallet() {
    try {
      return Wallet.fromMnemonic(this.mnemonic, `m/99'/66'/0'/0/0`)
    } catch(err) {
      throw new Error(err)
    }
  }

  saveMnemonic(password) {
    return new Promise(async (resolve, reject) => {
      if (window.plugins) {
        if (password == null && window.plugins.touchid) {
          window.plugins.touchid.save(`m/99'/66'/0'/0/0`, this.mnemonic,
          _ => resolve(true),
          err => reject(new Error(err))
          )
        } else {
          const encryptedMnemonic = AES.encrypt(this.mnemonic, password)
          NativeStorage.setItem(`m/99'/66'/0'/0/0`, encryptedMnemonic.toString(), _ => resolve(true), err => reject(throw new Error(err)));
        }
      } else {
        try {
          const encryptedMnemonic = AES.encrypt(this.mnemonic, password)
          await LF.setItem(`m/99'/66'/0'/0/0`, encryptedMnemonic.toString())
          resolve(true)
        } catch (err) {
          reject(throw new Error(err))
        }
      }
    })
  }

  static getMnemonic(password) {
    return new Promise(async (resolve, reject) => {
      if (window.plugins) {
        if (password == null && window.plugins.touchid) {
          window.plugins.touchid.verify(`m/99'/66'/0'/0/0`, "Please use your fingerprint to log in",
          async mnem => resolve(recoverKnucklesWallet(mnem)),
          err => reject(new Error(err))
          )
        } else {
          NativeStorage.getItem(`m/99'/66'/0'/0/0`, async cipher => {
            const bytes = await AES.decrypt(cipher.toString(), password)
            const plain = bytes.toString(enc.Utf8)
            resolve(recoverKnucklesWallet(plain))
          },
          err => reject(new Error(err))
          )
        }
      } else {
        try {
          const cipher = await LF.getItem(`m/99'/66'/0'/0/0`)
          if (cipher) {
            const bytes = await AES.decrypt(cipher.toString(), password)
            const plain = await bytes.toString(enc.Utf8)
            const wallet = recoverKnucklesWallet(plain)
            resolve(wallet)
          }
        } catch (err) {
          reject(new Error(err.message))
        }
      }
    })
  }

  credential(type, message) {
    const wallet = this.recoverWallet()
    const credential = Credential.create(type, message, wallet.publicKey)
    return credential
  }

  toJSON() {
    return classToPlain(this)
  }

  static fromJSON(json) {
    return plainToClass(KnucklesWallet, json)
  }

  @Expose()
  mnemonic() {
    return this.mnemonic
  }
}

function recoverKnucklesWallet(mnemonic) {
  try {
    const knucklesWallet = new KnucklesWallet()
    knucklesWallet.mnemonic = mnemonic
    knucklesWallet.wallet = knucklesWallet.recoverWallet()
    //delete knucklesWallet.mnemonic
    return knucklesWallet
  } catch (err) {
    throw new Error(err)
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
