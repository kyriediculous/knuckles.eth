import {Contract} from 'ethers'

const ContractProvider = (artifact, provider, wallet = undefined) => {
  if (!provider) throw new Error("Must supply a provider");
  if (!artifact.networks[provider.network.chainId]) throw new Error('Contract not deployed on provided network');
  if (!wallet) return new Contract(artifact.networks[provider.network.chainId].address, artifact.abi, provider);
  return new Contract(artifact.networks[provider.network.chainId].address, artifact.abi, wallet.connect(provider))
}

export default ContractProvider
