import {Contract} from 'ethers'

const ContractProvider = (artifact, walletOrProvider) => {
  if (walletOrProvider.chainId) {
    if (!artifact.networks[walletOrProvider.chainId]) {
      throw new Error('Contract not deployed on provided network')
    }
    return new Contract(artifact.networks[walletOrProvider.chainId].address, artifact.abi, walletOrProvider)
  } else {
    if (!artifact.networks[walletOrProvider.provider.chainId]) {
      throw new Error('Contract not deployed on provided network')
    }
    return new Contract(artifact.networks[walletOrProvider.provider.chainId].address, artifact.abi, walletOrProvider)
  }
}

export default ContractProvider
