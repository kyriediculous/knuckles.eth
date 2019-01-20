# Organisation Bounties

Set of smart contracts that allows someone to:

1. Create an organisation
2. Create a token for that organisation
3. Let people join the organisation
4. Issue bounties as the organisation for which tokens are minted
5. Have members issue bounties with their earned tokens

# Deploying the contracts

Install truffle
`npm install truffle -g`

## Compile
`truffle compile`

## Migrate to network
`truffle migrate --network <your network>`

eg. to deploy on [Ganache](https://truffleframework.com/ganache)
`truffle migrate --network ganache`

## Set an admin
`ADDRESS=<ethereum address> truffle exec post-migrations/set_admin.js --network <your network>`

eg. if you deployed on ganache
`ADDRESS=<ethereum address> truffle exec post-migrations/set_admin.js --network ganache`

# Testing the contracts
`truffle test --network <your network>`
