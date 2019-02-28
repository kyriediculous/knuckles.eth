"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ECcrypto = require("../utils/ECcrypto");

var _classTransformer = require("class-transformer");

require("reflect-metadata");

var _localforage = _interopRequireDefault(require("localforage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const credentialTypes = {
  bitbucket: {
    fieldNames: ['username', 'password'],
    type: ['credential', 'bitbucket'],
    name: 'bitbucket'
  }
};

class Credential {
  static create(type, message, publicKey) {
    const missing = [];
    const metadata = credentialTypes[type];
    metadata.fieldNames.forEach(name => {
      if (!Object.keys(message).includes(name)) missing.push(name);
    });

    if (missing.length > 0) {
      throw new Error(`
        Claim missing following fields: ${missing.toString()}, Expected following fields: ${metadata.fieldnames.toString()}
      `);
    } else {
      const credential = new Credential();
      metadata.fieldNames.forEach(name => {
        credential.credential[name] = message[name];
      });
      credential.type = metadata.type;
      credential.name = metadata.name;
      credential.publicKey = publicKey;
      credential.storeCredential();
      return credential;
    }
  }

  storeCredential() {
    return new Promise(async (resolve, reject) => {
      const value = await (0, _ECcrypto.encryptWithPublicKey)(JSON.stringify(this.toJSON()), this.publicKey);

      _localforage.default.setItem(`knuckles:${this.name}:${this.publicKey}`, value, () => resolve(true), err => reject(new Error(err)));
    });
  }

  static getCredential(key, privateKey) {
    return new Promise(async (resolve, reject) => {
      _localforage.default.getItem(`knuckles:${this.name}:${this.publicKey}`, async res => resolve((await (0, _ECcrypto.decryptWithPrivateKey)(res, privateKey))), err => reject(err));
    });
  }

  credential() {
    return this.credential.credential;
  }

  toJSON() {
    return (0, _classTransformer.classToPlain)(this);
  }

  static fromJSON(json) {
    return (0, _classTransformer.plainToClass)(Credential, json);
  }

}

var _default = Credential;
exports.default = _default;