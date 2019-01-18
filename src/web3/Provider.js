import {providers} from 'ethers'
const chains = {
  ganache: {
    meta: {name: 'ganache', chainId: 5777},
    nodes: ['http://localhost:7545']
  },
  clique: {
    meta: {name: 'clique', chainId: 999},
    nodes: ['http://10.0.2.2:8501', 'http://10.0.2.2:8502']
  },
  knuckles: {
    meta: {name: 'knuckles', chainId: 326432352},
    nodes: ['https://knuckle-node.designisdead.com']
  },
  development: {
    meta: {name: 'development', chainId: 6660001},
    nodes: ['http://localhost:8545']
  }
}

const Provider = (chain) => {
  try {
    let nodes = chains[chain].nodes.map((node) => {
      return new providers.JsonRpcProvider(node, {name: chains[chain].meta.name, chainId: chains[chain].meta.chainId})
    })
    return new providers.FallbackProvider(nodes)
  } catch (err) {
    throw new Error(err)
  }
}

export default Provider
