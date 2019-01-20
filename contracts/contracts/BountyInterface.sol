pragma solidity ^0.4.23;

import './BountyContract.sol';

contract BountyInterface {
  event logStartWork(address indexed _by, address indexed _bounty, uint _timestamp);
  event logContribute(address indexed _by, address indexed _bounty, uint _amount, uint _timestamp);
  event logCommit(address indexed _by, address indexed _bounty, uint _id, uint _timestamp);
  event logAccepted(address indexed _winner, address indexed _bounty, uint _id, uint _amount, uint _timestamp);
  event logCancelled(address indexed _by, address indexed _bounty, uint _timestamp);

  function createBounty( bytes32 _reference, address _issuer, uint _deadline , uint _reward, address _token) external;

  function getBounty() external view returns (bytes32, address, uint, uint, uint, BountyContract.statusOptions, address);

  function startWork() external;

  function getContributions() external view returns (uint);

  function getCommits() external view returns (uint);

  function cancelBounty() external;

  function submitCommit(bytes32 _reference)  external;

  function getCommit( uint _id)
    external
    view
    returns (
        bytes32,
        address,
        bool,
        uint
      );

  function acceptCommit(uint _id) external;

  function contribute(uint _amount) external;

  function refundContribution( uint _id, uint _amount) external;

  function getContribution(
    uint _id)
    external
    view
    returns (
      address,
      address,
      uint,
      uint
    );
}
