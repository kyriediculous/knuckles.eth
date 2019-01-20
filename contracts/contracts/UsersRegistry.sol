pragma solidity ^0.4.23;

contract UsersRegistry {

  mapping (address => bytes32) users;
  mapping (bytes32 => address) ens;

  event logRegister(bytes32 _name, address _address, bytes32 _profile);

  function register(bytes32 _name, bytes32 _profile) external {
    require(!isRegistered(msg.sender));
    users[msg.sender] = _profile;
    ens[_name] = msg.sender;
    emit logRegister(_name, msg.sender, _profile);
  }

  function update(bytes32 _newName, bytes32 _profile, bytes32 _oldName) external {
    require(isRegistered(msg.sender));
    users[msg.sender] = _profile;
    if (_newName != _oldName) {
      ens[_newName] = msg.sender;
      delete ens[_oldName];
    }
  }

  function get(address _user) external view returns (bytes32) {
    return users[_user];
  }

  function ensLookup(bytes32 _name) external view returns (address) {
    return ens[_name];
  }

  function isRegistered(address _user) public view returns (bool) {
    if (users[_user] == bytes32(0)) {
      return false;
    } else {
      return true;
    }
  }

  function whoAmI() public view returns (address) {
    return msg.sender;
  }
}
