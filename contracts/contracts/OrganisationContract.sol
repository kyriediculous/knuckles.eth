pragma solidity ^0.4.23;

import {MintableToken} from './Token.sol';
import './UsersRegistry.sol';

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

contract OrganisationContract is Administrators, ContractRegistry, Membership {

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
