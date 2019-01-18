import {Contract} from 'ethers'

const ContractProvider = (artifact, walletOrProvider) => {
  if (walletOrProvider.network.chainId) {
    if (!artifact.networks[walletOrProvider.network.chainId]) {
      throw new Error('Contract not deployed on provided network')
    }
    return new Contract(artifact.networks[walletOrProvider.network.chainId].address, artifact.abi, walletOrProvider)
  } else {
    if (!artifact.networks[walletOrProvider.provider.chainId]) {
      throw new Error('Contract not deployed on provided network')
    }
    return new Contract(artifact.networks[walletOrProvider.provider.network.chainId].address, artifact.abi, walletOrProvider)
  }
}

export default ContractProvider
