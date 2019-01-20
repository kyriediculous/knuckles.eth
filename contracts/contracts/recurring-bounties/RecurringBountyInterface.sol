pragma solidity ^0.4.23;

import './RecurringBountyContract.sol';

contract RecurringBountyInterface {
  event logRecurringStartWork(address indexed _by, address indexed _bounty, uint _timestamp);
  event logRecurringCommit(address indexed _by, address indexed _bounty, uint _id, uint _timestamp);
  event logRecurringAccepted(address indexed _winner, address indexed _bounty, uint _id, uint _amount, uint _timestamp);
  event logRecurringCancelled(address indexed _by, address indexed _bounty, uint _timestamp);

  enum statusOptions {ACTIVE, COMPLETED, ABANDONED}

  function createBounty(
    bytes32 _reference,
    address _issuer,
    uint _deadline,
    uint _reward,
    address _token) external;

  function getBounty() external view
      returns (
        bytes32,
        address,
        uint,
        uint,
        uint,
        RecurringBountyContract.statusOptions,
        address
        );

  function startWork() external;

  function getCommits() external view returns (uint);

  function cancelBounty() external;

  function submitCommit(bytes32 _reference) external;

  function getCommit(uint _id)
    external
    view
    returns (
      bytes32,
      address,
      bool,
      uint
    );

  function acceptCommit(uint _id) external;

  function withdraw(uint _amount, address _token) external;
}
