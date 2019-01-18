"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ethers = require("ethers");

const ContractProvider = (artifact, walletOrProvider) => {
  if (walletOrProvider.network.chainId) {
    if (!artifact.networks[walletOrProvider.network.chainId]) {
      throw new Error('Contract not deployed on provided network');
    }

    return new _ethers.Contract(artifact.networks[walletOrProvider.network.chainId].address, artifact.abi, walletOrProvider);
  } else {
    if (!artifact.networks[walletOrProvider.provider.chainId]) {
      throw new Error('Contract not deployed on provided network');
    }

    return new _ethers.Contract(artifact.networks[walletOrProvider.provider.network.chainId].address, artifact.abi, walletOrProvider);
  }
};

var _default = ContractProvider;
exports.default = _default;