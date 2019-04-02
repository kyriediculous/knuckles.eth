pragma solidity ^0.4.23;

import {ERC20} from './Token.sol';

contract BountyContract {
  //address public owner;
  address public imp; //match proxy storage
  bytes32 reference;
  address issuer;
  uint timestamp;
  uint deadline;
  uint reward;
  statusOptions status;
  Commit[] commits;
  Contribution[] contributions;
  address token;
  uint totalContributions;

  event logStartWork(address indexed _by, address indexed _bounty, uint _timestamp);
  event logContribute(address indexed _by, address indexed _bounty, uint _amount, uint _timestamp);
  event logCommit(address indexed _by, address indexed _bounty, uint _id, uint _timestamp);
  event logAccepted(address indexed _winner, address indexed _bounty, uint _id, uint _amount, uint _timestamp);
  event logCancelled(address indexed _by, address indexed _bounty, uint _timestamp);

  enum statusOptions {ACTIVE, COMPLETED, ABANDONED}

  struct Commit {
    bytes32 reference;
    address author;
    bool accepted;
    uint timestamp;
  }

  struct Contribution {
    address contributer;
    address token;
    uint amount;
    uint timestamp;
  }

  function createBounty(
    bytes32 _reference,
    address _issuer,
    uint _deadline,
    uint _reward,
    address _token) external {
      reference = _reference;
      issuer = _issuer;
      timestamp = now;
      deadline = _deadline;
      reward = _reward;
      status = statusOptions.ACTIVE;
      token = _token;
      totalContributions = _reward;
    }

  function getBounty() external view
    returns (
      bytes32,
      address,
      uint,
      uint,
      uint,
      statusOptions,
      address
      ) {
          return (
          reference,
          issuer,
          timestamp,
          deadline,
          totalContributions,
          status,
          token
          );
    }

  function startWork() external {
    require(status == statusOptions.ACTIVE);
    emit logStartWork(msg.sender, address(this), now);
  }

  function getCommits() external view returns (uint) {
    return commits.length;
  }

  function getContributions() external view returns (uint) {
    return contributions.length;
  }

  function cancelBounty() external {
    require(issuer == msg.sender);
    require(status == statusOptions.ACTIVE);
    require(totalContributions == reward);
    status = statusOptions.ABANDONED;
    if(!ERC20(token).transfer(issuer, reward)) revert();
    emit logCancelled(msg.sender, address(this), now);
  }

  function submitCommit(bytes32 _reference) external {
    require(issuer != msg.sender); //DISABLE FOR TESTING PURPOSES ONLY
    require(status == statusOptions.ACTIVE);
    require(deadline > now);
    Commit memory newCommit;
    newCommit.reference = _reference;
    newCommit.author = msg.sender;
    newCommit.accepted = false;
    newCommit.timestamp = now;
    uint _id = commits.push(newCommit) -1;
    emit logCommit(msg.sender, address(this), _id, now);
  }

  function getCommit(uint _id)
    external
    view
    returns (
      bytes32,
      address,
      bool,
      uint
    ) {
    return (commits[_id].reference, commits[_id].author, commits[_id].accepted, commits[_id].timestamp);
  }

  function acceptCommit(uint _id) external {
    require(issuer == msg.sender);
    require(status == statusOptions.ACTIVE);
    status = statusOptions.COMPLETED;
    commits[_id].accepted = true;
    if(!ERC20(token).transfer(commits[_id].author,  totalContributions)) revert();
    emit logAccepted(commits[_id].author, address(this), _id,  totalContributions, now);
  }

  function contribute(uint _amount) external {
    require(deadline > now);
     //For now accept only contributions in the token that the bounty is in
    require(status == statusOptions.ACTIVE);
    Contribution memory newContribution;
    newContribution.contributer = msg.sender;
    newContribution.token = token;
    newContribution.amount = _amount;
    newContribution.timestamp = now;
    contributions.push(newContribution);
    totalContributions += _amount; //SAFEMATH THIS
    if (!ERC20(token).transferFrom(msg.sender, address(this), _amount)) revert();
    emit logContribute(msg.sender, address(this), _amount, now);
  }

  function refundContribution(uint _id, uint _amount) external {
    require(status != statusOptions.COMPLETED);
    require(contributions[_id].contributer == msg.sender);
    require(contributions[_id].amount >= _amount);
    contributions[_id].amount -= _amount; //SAFEMATH THIS
    totalContributions -= _amount; //SAFEMATH this
    if(!ERC20(contributions[_id].token).transfer(msg.sender, _amount)) revert();  }

  function getContribution(
    uint _id)
    external
    view
    returns (
      address,
      address,
      uint,
      uint
    ) {
        return  (
          contributions[_id].contributer,
          contributions[_id].token,
          contributions[_id].amount,
          contributions[_id].timestamp
          );    }

}
