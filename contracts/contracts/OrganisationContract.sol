pragma solidity ^0.4.23;

import {MintableToken} from './Token.sol';
import './UsersRegistry.sol';
import './BountyProxy.sol';
import {BountyInterface} from './BountyInterface.sol';
import {ERC20} from './Token.sol';

//We need isAdmin and isMember functions
// calling the mappings from other contracts will not work as there is no such function , we would have to make an interface or a seperate function that returns a boolean

interface Organisation {
  function isAdmin(address _user) external view returns (bool);
  function isMember(address _user) external view returns (bool);
  function mintToken(address _to, uint _amount) external;
  function contracts(bytes32 _name) external view returns (address);
}
contract Administrators {

  mapping(address => bool) public admins;

  event logAdminChange(address _changedAdmin, bool _status,  address _setBy, uint _timestamp);

  constructor() public {
    admins[msg.sender] = true;
  }

  function isAdmin(address _user) public view returns (bool) {
    return admins[_user];
  }

  function addAdmin(address _newAdmin) external {
    require(isAdmin(msg.sender));
    require(_newAdmin != address(0));
    admins[_newAdmin] = true;
    emit logAdminChange(_newAdmin, true, msg.sender, now);
  }

  function removeAdmin(address _remove) external {
    require(isAdmin(msg.sender));
    require(_remove != address(0));
    delete admins[_remove];
    emit logAdminChange(_remove, false, msg.sender, now);
  }
}

contract ContractRegistry is Administrators {

  mapping(bytes32 => address) public contracts;
  mapping(address => bool) public tokenAccess;

  function addContract(bytes32 _name, address _destination) public {
      require(isAdmin(msg.sender));
      contracts[_name] = _destination;
  }

  function removeContract(bytes32 _name) public {
      require(isAdmin(msg.sender));
      delete contracts[_name];
  }

  function changeTokenAccess(address _contract) public {
    require(isAdmin(msg.sender));
    tokenAccess[_contract] = !tokenAccess[_contract];
  }
}

contract Membership is ContractRegistry {

  event logJoin(address _user, uint _timestamp);
  event logBlacklist(address _subject, address _by, uint _timestamp);
  event logWhitelist(address _subject, address _by, uint _timestamp);
  event logApprove(address _subject, address _by, uint _timestamp, bool _accepted);

  mapping(address => bool) public pending;
  mapping(address => bool) public members;
  mapping(address => bool) public blacklisted;

  bool public requireApproval;

  function isMember(address _user) public view returns (bool) {
    return members[_user];
  }

  function toggleApproval() external {
      require(isAdmin(msg.sender));
      requireApproval = !requireApproval;
  }

  function join() external {
    require(UsersRegistry(contracts["users"]).isRegistered(msg.sender));
    require(!blacklisted[msg.sender]);
    if (requireApproval) {
     pending[msg.sender] = true;
    } else {
     members[msg.sender] = true;
    }
    emit logJoin(msg.sender, now);
  }

  function approve(address _user, bool _accepted) external {
    require(isAdmin(msg.sender));
    require(!blacklisted[msg.sender]);
    if (_accepted) {
      pending[_user] = false;
      members[_user] = true;
      emit logApprove(_user, msg.sender, now, _accepted);
    } else {
      pending[_user] = false;
      emit logApprove(_user, msg.sender, now, _accepted);
    }
  }

  function leave() external {
    delete members[msg.sender];
  }

  function blacklist(address _user) external {
    require(isAdmin(msg.sender));
    blacklisted[_user] = true;
    delete members[_user];
    emit logBlacklist(_user, msg.sender, now);
  }

  function whitelist(address _user) external {
    require(isAdmin(msg.sender));
    delete blacklisted[_user];
    members[_user] = true;
    emit logWhitelist(_user, msg.sender, now);
  }
}

contract Timesheets {

  address public organisation;

  uint public reward;

  event logTimesheetPeriod(address indexed _user, uint  indexed _periodStart, bool _completed, address _approver, uint _reward);

  struct Period {
    uint start;
    bool completed;
  }

  mapping(address => Period[]) public timesheets;

      constructor(address _organisation) public {
        organisation =_organisation;
    }

  function setPeriod(address _user, uint _start, bool _completed) external {
    require(Organisation(organisation).isAdmin(msg.sender));
    require(_checkLatest(_start, _user));
    Period memory p;
    p.start = _start;
    p.completed = _completed;
    timesheets[_user].push(p);
    if (_completed) Organisation(organisation).mintToken(_user, reward);
    emit logTimesheetPeriod(_user, _start, _completed, msg.sender, reward);
  }

  function getLast(address _user) external view returns (uint, bool) {
    if (timesheets[_user].length > 0) return (timesheets[_user][timesheets[_user].length-1].start, timesheets[_user][timesheets[_user].length-1].completed);
  }

  function setReward(uint _reward) external {
    require(Organisation(organisation).isAdmin(msg.sender));
    reward = _reward;
  }

  function _checkLatest(uint _start, address _user) internal view returns (bool) {
    return timesheets[_user].length > 0 ? timesheets[_user][timesheets[_user].length - 1].start < _start : _start > 0;
  }
}

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

contract TokenFaucet {
    address public organisation;

    constructor(address _organisation) public {
        organisation = _organisation;
    }

    //Lets make it a one time faucet to reduce bytecode size by not needing SafeMath for one function

    uint public faucetLimit;

    event logFaucet(address _user, uint _amount, uint _date);

    mapping(address => bool) public received;

    function setLimit(uint _limit) external {
        require(Organisation(organisation).isAdmin(msg.sender));
        faucetLimit =  _limit;
    }

    function faucet() external {
        require(Organisation(organisation).isMember(msg.sender));
        require(!received[msg.sender]);
        received[msg.sender] = true;
        Organisation(organisation).mintToken(msg.sender, faucetLimit);
        emit logFaucet(msg.sender, faucetLimit, now);
    }
}

contract RewardStore  {

    address public organisation;

    constructor(address _organisation) public {
        organisation = _organisation;
    }

    event logPurchase(bytes32 _reference, uint _price, uint _index);

    struct Listing {
        bytes32 reference;
        uint price;
        bool active;
    }

    Listing[] public listings;

    function addListing(bytes32 _reference, uint _price) external {
        require(Organisation(organisation).isAdmin(msg.sender));
        Listing memory l;
        l.reference = _reference;
        l.price = _price;
        l.active = true;
        listings.push(l);
    }

    function updateListing(uint _index, bytes32 _reference, uint _price) external {
      require(Organisation(organisation).isAdmin(msg.sender));
      listings[_index].reference = _reference;
      listings[_index].price = _price;
    }

    function changeActive(uint _index) external {
      require(Organisation(organisation).isAdmin(msg.sender));
      listings[_index].active = !listings[_index].active;
    }

    function removeListing(uint _index) external {
      require(Organisation(organisation).isAdmin(msg.sender));
      delete listings[_index];
    }

    function purchase(uint _index) external {
        require(Organisation(organisation).isMember(msg.sender));
        require(listings[_index].active);
        if(!ERC20(Organisation(organisation).contracts("token")).transferFrom(msg.sender, address(this), listings[_index].price)) revert();
        MintableToken(Organisation(organisation).contracts("token")).burn(listings[_index].price);
        emit logPurchase(listings[_index].reference, listings[_index].price, _index);
    }

    function listingsAmount() external view returns (uint) {
      return listings.length;
    }
}

//Timesheets, bountyfactyory, rewards, faucet should be upgradeable (??) and modular additions
// Making these upgradeable would imply a proxy setup similar to bounties
// Calling all modules from the organisation contract directly is not possible
contract OrganisationContract is Membership {

  event logCreateOrganisation(address _contract, address _creator, uint _timestamp);

  constructor () public {
    emit logCreateOrganisation(address(this), msg.sender, now);
  }

  function setOrganisationIdentity(bytes32 _name, bytes32 _profile) external {
    require(isAdmin(msg.sender));
    UsersRegistry(contracts["users"]).register(_name, _profile);
  }

  function mintToken(address _to, uint _amount) public {
    require(isAdmin(msg.sender) || tokenAccess[msg.sender]);
    MintableToken(contracts["token"]).mint(_to, _amount);
  }
}
