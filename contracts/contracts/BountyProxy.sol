pragma solidity ^0.4.23;

contract BountyProxy {
  //address public owner;
  address public impl;
  constructor (address _impl) public {
      impl = _impl;
      //owner == msg.sender;
  }
  /**
  * @dev Fallback function allowing to perform a delegatecall to the given implementation.
  * This function will return whatever the implementation call returns
  */
  function () public {
    require(msg.sig != 0x0);
    address _impl = impl;
    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, calldatasize)
      let result := delegatecall(gas, _impl, ptr, calldatasize, ptr, 0)
      let size := returndatasize
      returndatacopy(ptr, 0, size)

      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }

  /*
  function upgrade(address _impl) {
    require(msg.sender == owner);
    impl = _impl;
  }
  */
}




//For the lunch session:
// Calling functions on a contract is abstract for
// Sending messages to an address on the blockchain
// Of type contract (there is regular wallet addresses too)
// This address contains the bytecode of the contract
// In reality messages are sent to the contract address with a calldata
// Here msg.sig represents the first 4 bytes of the calldata
// Which represents the function signatures (bytes4(keccak256(myFunction())))
// When msg is broadcast to peers they see that the receiver is a contract address
// They will execute the bytecode associated with that receiver contract address
// Along with the calldata in the message
// The transaction is accepted when all the peers have the same output
