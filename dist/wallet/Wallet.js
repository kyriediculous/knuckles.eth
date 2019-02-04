"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bip = _interopRequireDefault(require("bip39"));

var _ethers = require("ethers");

var _classTransformer = require("class-transformer");

require("reflect-metadata");

var _localforage = _interopRequireDefault(require("localforage"));

var _cryptoJs = require("crypto-js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class KnucklesWallet {
  static async create(password = null) {
    try {
      const knucklesWallet = new KnucklesWallet();

      const mnemonic = _bip.default.generateMnemonic();

      knucklesWallet.wallet = _ethers.Wallet.fromMnemonic(mnemonic, `m/99'/66'/0'/0/0`);
      await knucklesWallet.saveWallet(password);
      return knucklesWallet;
    } catch (err) {
      throw new Error(err);
    }
  }

  static async restore(mnemonic, password) {
    try {
      const knucklesWallet = new KnucklesWallet();
      knucklesWallet.wallet = _ethers.Wallet.fromMnemonic(mnemonic, `m/99'/66'/0'/0/0`);
      await knucklesWallet.saveWallet(password);
      return knucklesWallet;
    } catch (err) {
      throw new Error(err);
    }
  }

  static exists() {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await _localforage.default.getItem(`m/99'/66'/0'/0/0`);

        if (res) {
          resolve('password');
        } else {
          resolve(false);
        }
      } catch (err) {
        reject(new Error(err));
      }
    });
  }

  saveWallet(password) {
    return new Promise(async (resolve, reject) => {
      try {
        //Options to change the speed (this is linear with security)!!!!
        let options = {
          scrypt: {
            N: 1 << 16
          }
        };
        const encrypted = await this.wallet.encrypt(password, options);
        await _localforage.default.setItem(`m/99'/66'/0'/0/0`, encrypted);
        resolve(true);
      } catch (e) {
        reject(new Error(e));
      }
    });
  }

  static getWallet(password) {
    return new Promise(async (resolve, reject) => {
      try {
        const secretStorage = await _localforage.default.getItem(`m/99'/66'/0'/0/0`);

        if (!secretStorage.startsWith('{"address":')) {
          const bytes = await _cryptoJs.AES.decrypt(secretStorage.toString(), password);
          const plain = await bytes.toString(_cryptoJs.enc.Utf8);
          resolve((await KnucklesWallet.restore(plain, password)));
        }

        if (secretStorage) {
          resolve((await _ethers.Wallet.fromEncryptedJson(secretStorage, password)));
        }
      } catch (e) {
        reject(new Error(e.message));
      }
    });
  }

  toJSON() {
    return (0, _classTransformer.classToPlain)(this);
  }

  static fromJSON(json) {
    return (0, _classTransformer.plainToClass)(KnucklesWallet, json);
  }

  mnemonic() {
    return this.wallet.mnemonic;
  }

}

var _default = KnucklesWallet;
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

exports.default = _default;