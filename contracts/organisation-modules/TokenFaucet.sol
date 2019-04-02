pragma solidity ^0.4.23;

import {Organisation} from '../OrganisationContract.sol';

contract TokenFaucet {
    address public organisation;

    constructor(address _organisation) public {
        organisation = _organisation;
    }

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