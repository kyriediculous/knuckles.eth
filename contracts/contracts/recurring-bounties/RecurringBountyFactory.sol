pragma solidity ^0.4.23;

import './RecurringBountyInterface.sol';
import '../OrganisationContract.sol';
import '../BountyProxy.sol';

contract RecurringBountyFactory {
  address organisation;

  event logRecurringBountyCreated(address indexed issuer, address bounty, bytes32 _reference);

    constructor(address _organisation, bytes32 _name, bytes32 _profile) public {
        organisation = _organisation;
        address _users = Organisation(_organisation).contracts("users");
        UsersRegistry(_users).register(_name, _profile);
    }

  function createBounty(bytes32 _reference, uint _deadline, uint _reward, uint _funding) external {
    require(_reward > 0);
    require(_funding >= _reward, "1 payout minimum");
    require(OrganisationContract(organisation).isMember(msg.sender), "Unauthorized");
    address _bounty = new BountyProxy(OrganisationContract(organisation).contracts("recurring-bounty"));
    RecurringBountyInterface(_bounty).createBounty(_reference, msg.sender, _deadline, _reward, OrganisationContract(organisation).contracts("token"));
    if(!ERC20(OrganisationContract(organisation).contracts("token")).transferFrom(msg.sender, _bounty, _funding)) revert();
    emit logRecurringBountyCreated( msg.sender, address(_bounty), _reference);
  }

  function createMintableBounty(bytes32 _reference, uint _deadline, uint _reward, uint _funding) external {
    require(_reward > 0);
    require(_funding >= _reward, "1 payout minimum");
    require(OrganisationContract(organisation).isMember(msg.sender), "Unauthorized");
    address _bounty = new BountyProxy(OrganisationContract(organisation).contracts("recurring-bounty"));
    RecurringBountyInterface(_bounty).createBounty(_reference, address(this), _deadline, _reward, OrganisationContract(organisation).contracts("token"));
    OrganisationContract(organisation).mintToken(_bounty, _funding);
    emit logRecurringBountyCreated(organisation, address(_bounty), _reference);
  }

  function acceptMintable(address _bounty, uint _id) external {
    require(OrganisationContract(organisation).isAdmin(msg.sender), "Unauthorized");
    RecurringBountyInterface(_bounty).acceptCommit(_id);
  }

  function cancelMintable(address _bounty) external {
    require(OrganisationContract(organisation).isAdmin(msg.sender), "Unauthorized");
    RecurringBountyInterface(_bounty).cancelBounty();
  }

  function mintFunding(address _bounty, uint _funding) external {
    require(OrganisationContract(organisation).isAdmin(msg.sender), "Unauthorized");
    OrganisationContract(organisation).mintToken(_bounty, _funding);
  }
  /*
  function upgradeMintable(address _bounty, address _implementation) external {
    require(OrganisationContract(organisation).isAdmin(msg.sender), "Unauthorized");
    BountyProxy(_bounty).upgrade(_implementation);
  }
  */
}
