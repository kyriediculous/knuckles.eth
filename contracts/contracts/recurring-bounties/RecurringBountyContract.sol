pragma solidity ^0.4.23;

import {ERC20} from '../Token.sol';

contract RecurringBountyContract {
  //address public owner;
  address public imp; //match proxy storage
  bytes32 reference;
  address issuer;
  uint timestamp;
  uint deadline;
  uint reward;
  statusOptions status;
  Commit[] commits;
  address token;

  event logRecurringStartWork(address indexed _by, address indexed _bounty, uint _timestamp);
  event logRecurringCommit(address indexed _by, address indexed _bounty, uint _id, uint _timestamp);
  event logRecurringAccepted(address indexed _winner, address indexed _bounty, uint _id, uint _amount, uint _timestamp);
  event logRecurringCancelled(address indexed _by, address indexed _bounty, uint _timestamp);

  enum statusOptions {ACTIVE, COMPLETED, ABANDONED}

  struct Commit {
    bytes32 reference;
    address author;
    bool accepted;
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
          reward,
          status,
          token
          );
    }

  function startWork() external {
      require(status == statusOptions.ACTIVE);
      require(ERC20(token).balanceOf(address(this)) >= reward, "Contract not enough  balance");
      emit logRecurringStartWork(msg.sender, address(this), now);
  }

  function getCommits() external view returns (uint) {
    return commits.length;
  }

  function cancelBounty() external {
    require(issuer == msg.sender, "Unauthorized");
    require(status == statusOptions.ACTIVE);
    status = statusOptions.ABANDONED;
    if(!ERC20(token).transfer(issuer, ERC20(token).balanceOf(address(this)) )) revert();
    emit logRecurringCancelled(msg.sender, address(this), now);
  }

  function submitCommit(bytes32 _reference) external {
    require(ERC20(token).balanceOf(address(this)) >= reward, "Contract not enough balance");
    require(issuer != msg.sender, "Unauthorized"); //DISABLE FOR TESTING PURPOSES ONLY
    require(deadline > now);
    require(status == statusOptions.ACTIVE);
    Commit memory newCommit;
    newCommit.reference = _reference;
    newCommit.author = msg.sender;
    newCommit.accepted = false;
    newCommit.timestamp = now;
    uint _id = commits.push(newCommit) -1;
    emit logRecurringCommit(msg.sender, address(this), _id, now);
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
    require(ERC20(token).balanceOf(address(this)) >= reward, "Contract not enough balance");
    require(issuer == msg.sender, "Unauthorized");
    require(status == statusOptions.ACTIVE);
    commits[_id].accepted = true;
    if(!ERC20(token).transfer(commits[_id].author,  reward)) revert();
    emit logRecurringAccepted(commits[_id].author, address(this), _id,  reward, now);
  }

  function withdraw(uint _amount, address _token) external {
    require(issuer == msg.sender, "Unauthorized");
    if (_token != address(0)) {
      require(ERC20(token).balanceOf(address(this)) >= _amount, "Contract not enough balance");
      if(!ERC20(token).transfer(issuer, _amount)) revert();
    } else {
      issuer.transfer(_amount);
    }
  }

}
