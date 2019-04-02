pragma solidity ^0.4.23;

import {ERC20} from '../Token.sol';
import {Organisation} from '../OrganisationContract.sol';

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
