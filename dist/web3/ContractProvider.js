"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ethers = require("ethers");

const ContractProvider = (artifact, provider, wallet = undefined) => {
  if (!provider) throw new Error("Must supply a provider");
  if (!artifact.networks[provider.network.chainId]) throw new Error('Contract not deployed on provided network');
  if (!wallet) return new _ethers.Contract(artifact.networks[provider.network.chainId].address, artifact.abi, provider);
  return new _ethers.Contract(artifact.networks[provider.network.chainId].address, artifact.abi, wallet.connect(provider));
};

var _default = ContractProvider;
exports.default = _default;