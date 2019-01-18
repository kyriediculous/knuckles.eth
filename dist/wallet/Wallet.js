"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bip = _interopRequireDefault(require("bip39"));

var _ethers = require("ethers");

var _classTransformer = require("class-transformer");

require("reflect-metadata");

var _Credential = _interopRequireDefault(require("./Credential"));

var _localforage = _interopRequireDefault(require("localforage"));

var _cryptoJs = require("crypto-js");

var _dec, _class;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object['ke' + 'ys'](descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object['define' + 'Property'](target, property, desc); desc = null; } return desc; }

let KnucklesWallet = (_dec = (0, _classTransformer.Expose)(), (_class = class KnucklesWallet {
  static async create(password = null) {
    try {
      const knucklesWallet = new KnucklesWallet();

      const mnemonic = _bip.default.generateMnemonic();

      knucklesWallet.mnemonic = mnemonic;
      knucklesWallet.wallet = knucklesWallet.recoverWallet();
      await knucklesWallet.saveMnemonic(password);
      return knucklesWallet;
    } catch (err) {
      throw new Error(err);
    }
  }

  static async restore(mnemonic, password) {
    try {
      const knucklesWallet = new KnucklesWallet();
      knucklesWallet.mnemonic = mnemonic;
      knucklesWallet.wallet = knucklesWallet.recoverWallet();
      await knucklesWallet.saveMnemonic(password);
      return knucklesWallet;
    } catch (err) {
      throw new Error(err);
    }
  }

  static exists() {
    return new Promise(async (resolve, reject) => {
      if (window.plugins) {
        //CORDOVA
        if (window.plugins.touchid) {
          window.plugins.touchid.has(`m/99'/66'/0'/0/0`, _ => resolve("touchid"), _ => NativeStorage.getItem(`m/99'/66'/0'/0/0`, res => {
            if (res) resolve("password");
          }, err => reject(throw new Error(err))));
        } else {
          NativeStorage.getItem(`m/99'/66'/0'/0/0`, res => resolve("password"), err => reject(throw new Error(err)));
        }
      } else {
        //BROWSER
        try {
          const res = await _localforage.default.getItem(`m/99'/66'/0'/0/0`);

          if (res) {
            resolve("password");
          } else {
            resolve(false);
          }
        } catch (err) {
          reject(throw new Error(err));
        }
      }
    });
  }

  recoverWallet() {
    try {
      return _ethers.Wallet.fromMnemonic(this.mnemonic, `m/99'/66'/0'/0/0`);
    } catch (err) {
      throw new Error(err);
    }
  }

  saveMnemonic(password) {
    return new Promise(async (resolve, reject) => {
      if (window.plugins) {
        if (password == null && window.plugins.touchid) {
          window.plugins.touchid.save(`m/99'/66'/0'/0/0`, this.mnemonic, _ => resolve(true), err => reject(new Error(err)));
        } else {
          const encryptedMnemonic = _cryptoJs.AES.encrypt(this.mnemonic, password);

          NativeStorage.setItem(`m/99'/66'/0'/0/0`, encryptedMnemonic.toString(), _ => resolve(true), err => reject(throw new Error(err)));
        }
      } else {
        try {
          const encryptedMnemonic = _cryptoJs.AES.encrypt(this.mnemonic, password);

          await _localforage.default.setItem(`m/99'/66'/0'/0/0`, encryptedMnemonic.toString());
          resolve(true);
        } catch (err) {
          reject(throw new Error(err));
        }
      }
    });
  }

  static getMnemonic(password) {
    return new Promise(async (resolve, reject) => {
      if (window.plugins) {
        if (password == null && window.plugins.touchid) {
          window.plugins.touchid.verify(`m/99'/66'/0'/0/0`, "Please use your fingerprint to log in", async mnem => resolve(recoverKnucklesWallet(mnem)), err => reject(new Error(err)));
        } else {
          NativeStorage.getItem(`m/99'/66'/0'/0/0`, async cipher => {
            const bytes = await _cryptoJs.AES.decrypt(cipher.toString(), password);
            const plain = bytes.toString(_cryptoJs.enc.Utf8);
            resolve(recoverKnucklesWallet(plain));
          }, err => reject(new Error(err)));
        }
      } else {
        try {
          const cipher = await _localforage.default.getItem(`m/99'/66'/0'/0/0`);

          if (cipher) {
            const bytes = await _cryptoJs.AES.decrypt(cipher.toString(), password);
            const plain = await bytes.toString(_cryptoJs.enc.Utf8);
            const wallet = recoverKnucklesWallet(plain);
            resolve(wallet);
          }
        } catch (err) {
          reject(new Error(err.message));
        }
      }
    });
  }

  credential(type, message) {
    const wallet = this.recoverWallet();

    const credential = _Credential.default.create(type, message, wallet.publicKey);

    return credential;
  }

  toJSON() {
    return (0, _classTransformer.classToPlain)(this);
  }

  static fromJSON(json) {
    return (0, _classTransformer.plainToClass)(KnucklesWallet, json);
  }

  mnemonic() {
    return this.mnemonic;
  }

}, (_applyDecoratedDescriptor(_class.prototype, "mnemonic", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "mnemonic"), _class.prototype)), _class));

function recoverKnucklesWallet(mnemonic) {
  try {
    const knucklesWallet = new KnucklesWallet();
    knucklesWallet.mnemonic = mnemonic;
    knucklesWallet.wallet = knucklesWallet.recoverWallet(); //delete knucklesWallet.mnemonic

    return knucklesWallet;
  } catch (err) {
    throw new Error(err);
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