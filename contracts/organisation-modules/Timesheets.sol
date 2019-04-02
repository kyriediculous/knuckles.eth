pragma solidity ^0.4.23;

import {Organisation} from '../OrganisationContract.sol';


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