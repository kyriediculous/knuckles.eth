import {encryptWithPublicKey, decryptWithPrivateKey} from '../utils/ECcrypto'
import {
  classToPlain,
  plainToClass
} from 'class-transformer'
import 'reflect-metadata'
import LF from 'localforage'

const credentialTypes = {
  bitbucket: {
    fieldNames: ['username', 'password'],
    type: ['credential', 'bitbucket'],
    name: 'bitbucket'
  }
}

class Credential {
  static create(type, message, publicKey) {
    const missing = []
    const metadata = credentialTypes[type]
    metadata.fieldNames.forEach(name => {
      if (!Object.keys(message).includes(name)) missing.push(name)
    })
    if (missing.length > 0) {
      throw new Error(`
        Claim missing following fields: ${missing.toString()}, Expected following fields: ${metadata.fieldnames.toString()}
      `)
    } else {
      const credential = new Credential()
      metadata.fieldNames.forEach(name => {
        credential.credential[name] = message[name]
      })
      credential.type = metadata.type
      credential.name = metadata.name
      credential.publicKey = publicKey
      credential.storeCredential()
      return credential
    }
  }

  storeCredential() {
    return new Promise(async (resolve, reject) => {
      const value = await encryptWithPublicKey(JSON.stringify(this.toJSON()), this.publicKey)
      LF.setItem(`knuckles:${this.name}:${this.publicKey}`, value, () => resolve(true), err => reject(new Error(err)))
    })
  }

  static getCredential(key, privateKey) {
    return new Promise(async (resolve, reject) => {
      LF.getItem(`knuckles:${this.name}:${this.publicKey}`, async res => resolve(await decryptWithPrivateKey(res, privateKey)), err => reject(err) )
    })
  }

  credential() {
    return this.credential.credential
  }

  toJSON() {
    return classToPlain(this)
  }

  static fromJSON(json) {
    return plainToClass(Credential, json)
  }
}

export default Credential
