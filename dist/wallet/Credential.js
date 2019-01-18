"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ECcrypto = require("../utils/ECcrypto");

var _classTransformer = require("class-transformer");

require("reflect-metadata");

var _dec, _class;

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object['ke' + 'ys'](descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object['define' + 'Property'](target, property, desc); desc = null; } return desc; }

const credentialTypes = {
  bitbucket: {
    fieldNames: ['username', 'password'],
    type: ['credential', 'bitbucket'],
    name: 'bitbucket'
  }
};
let Credential = (_dec = (0, _classTransformer.Expose)(), (_class = class Credential {
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
      NativeStorage.setItem(`knuckles:${this.name}:${this.publicKey}`, value, _ => resolve(true), err => reject(new Error(err)));
    });
  }

  static getCredential(key, privateKey) {
    return new Promise(async (resolve, reject) => {
      NativeStorage.getItem(`knuckles:${this.name}:${this.publicKey}`, async res => resolve((await (0, _ECcrypto.decryptWithPrivateKey)(res, privateKey))), err => reject(err));
    });
  }

  credential() {
    return this.credential.credential;
  }

  toJSON() {
    return (0, _classTransformer.classToPlain)(this);
  }

  static fromJSON(json) {
    return (0, _classTransformer.plainToClass)(claim, json);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "credential", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "credential"), _class.prototype)), _class));
var _default = Credential;
exports.default = _default;