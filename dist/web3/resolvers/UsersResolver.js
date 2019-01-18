"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
exports.update = update;
exports.get = get;
exports.ensLookup = ensLookup;
exports.isAdmin = isAdmin;

var _UsersRegistry = _interopRequireDefault(require("../artifacts/UsersRegistry.json"));

var _OrganisationContract = _interopRequireDefault(require("../artifacts/OrganisationContract.json"));

var _utils = require("ethers/utils");

var _conversion = require("../../utils/conversion");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function register(name, swarmHash, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const usersregistry = this.ContractProvider(_UsersRegistry.default, wallet);
    let tx = await usersregistry.register((0, _conversion.stringToHex)(name.toLowerCase()), swarmHash, {
      gasPrice: '0x0'
    });
    await this.provider.waitForTransaction(tx.hash);
    const organisation = this.ContractProvider(_OrganisationContract.default, wallet);
    tx = await organisation.join();
    return this.provider.waitForTransaction(tx.hash);
  } catch (err) {
    throw new Error(err);
  }
}

async function update(newName, swarmHash, oldName, wallet) {
  try {
    if (wallet.provider === undefined) wallet.provider = this.provider;
    const usersregistry = this.ContractProvider(_UsersRegistry.default, wallet);
    let tx = await usersregistry.update((0, _conversion.stringToHex)(newName.toLowerCase()), swarmHash, (0, _conversion.stringToHex)(oldName.toLowerCase()), {
      gasPrice: '0x0'
    });
    return this.provider.waitForTransaction(tx.hash);
  } catch (err) {
    throw new Error(err);
  }
}

async function get(address) {
  try {
    const usersregistry = this.ContractProvider(_UsersRegistry.default, this.provider);
    return await usersregistry.get(address);
  } catch (err) {
    throw new Error(err);
  }
}

async function ensLookup(name) {
  try {
    const usersregistry = this.ContractProvider(_UsersRegistry.default, this.provider);
    return await usersregistry.ensLookup((0, _conversion.stringToHex)(name.toLowerCase()));
  } catch (err) {
    throw new Error(err);
  }
}

async function isAdmin(userAddress) {
  try {
    const organisation = this.ContractProvider(_OrganisationContract.default, this.provider);
    return await organisation.admins(userAddress);
  } catch (err) {
    throw new Error(err);
  }
}