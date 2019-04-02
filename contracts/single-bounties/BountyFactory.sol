pragma solidity ^0.4.23;

import './BountyInterface.sol';
import '../OrganisationContract.sol';
import '../BountyProxy.sol';

contract BountyFactory {
  address organisation;

  event logBountyCreated(address indexed issuer, address bounty, bytes32 _reference);

      constructor(address _organisation, bytes32 _name, bytes32 _profile) public {
        organisation = _organisation;
        address _users = Organisation(_organisation).contracts("users");
        UsersRegistry(_users).register(_name, _profile);
    }

  function createBounty(bytes32 _reference, uint _deadline, uint _reward) external {
    require(_reward > 0);
     require(Organisation(organisation).isMember(msg.sender));
    address _bounty = new BountyProxy(Organisation(organisation).contracts("bounty"));
    BountyInterface(_bounty).createBounty(_reference, msg.sender, _deadline, _reward, Organisation(organisation).contracts("token"));
    if(!ERC20(Organisation(organisation).contracts("token")).transferFrom(msg.sender, _bounty, _reward)) revert();
    emit logBountyCreated( msg.sender, address(_bounty), _reference);
  }

//ORGANISATION IDENTITY MUST BE BOUND TO THE BOUNTYFACTORY INSTEAD
  function createMintableBounty(bytes32 _reference, uint _deadline, uint _reward) external {
    require(_reward > 0);
    require(Organisation(organisation).isAdmin(msg.sender));
    address _bounty = address(new BountyProxy(Organisation(organisation).contracts("bounty")));
    BountyInterface(_bounty).createBounty(_reference, address(this), _deadline, _reward, Organisation(organisation).contracts("token"));
    Organisation(organisation).mintToken(_bounty, _reward);
    emit logBountyCreated(address(this), address(_bounty), _reference);
  }

  function acceptMintable(address _bounty, uint _id) external {
    require(Organisation(organisation).isAdmin(msg.sender));
    BountyInterface(_bounty).acceptCommit(_id);
  }

  function cancelMintable(address _bounty) external {
    require(Organisation(organisation).isAdmin(msg.sender));
    BountyInterface(_bounty).cancelBounty();
  }

  /*
  function upgradeMintable(address _bounty, address _implementation) external {
    require(Organisation(organisation).isAdmin(msg.sender));
    BountyProxy(_bounty).upgrade(_implementation);
  }
  */

}