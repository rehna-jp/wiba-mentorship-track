// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract advancedStorage{


address owner;
uint256 number;
  constructor (){
     owner = msg.sender;
  }

  event NumberUpdated(uint256  number);
  event NumberReset(uint256  number);

  function setNumber(uint256 _number) public {
     number = _number;
     emit NumberUpdated(number);
  }

  function getNumber() public view returns(uint256) {
    return number;
  }

  function resetNumber() public onlyOwner{
    number = 0;
    emit NumberReset(number);
  }
    
   modifier onlyOwner {
    require(msg.sender == owner, "Only owner can reset thenumber");
    _;
   }  
}