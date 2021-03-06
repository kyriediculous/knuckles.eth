"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
exports.update = update;
exports.get = get;
exports.ensLookup = ensLookup;
exports.isAdmin = isAdmin;

var _UsersRegistry = _interopRequireDefault(require("../../../contracts/build/contracts/UsersRegistry.json"));

var _OrganisationContract = _interopRequireDefault(require("../../../contracts/build/contracts/OrganisationContract.json"));

var _utils = require("ethers/utils");

var _ = require("../../utils/_");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function register(name, swarmHash, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const usersregistry = this.ContractProvider(_UsersRegistry.default, this.provider, wallet);
    let tx = await usersregistry.register((0, _.stringToHex)(name.toLowerCase()), swarmHash, {
      gasPrice: (0, _utils.parseEther)('0')
    });
    await tx.wait();
    const organisation = this.ContractProvider(_OrganisationContract.default, this.provider, wallet);
    tx = await organisation.join();
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function update(newName, swarmHash, oldName, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const usersregistry = this.ContractProvider(_UsersRegistry.default, this.provider, wallet);
    let tx = await usersregistry.update((0, _.stringToHex)(newName.toLowerCase()), swarmHash, (0, _.stringToHex)(oldName.toLowerCase()), {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
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
    return await usersregistry.ensLookup((0, _.stringToHex)(name.toLowerCase()));
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