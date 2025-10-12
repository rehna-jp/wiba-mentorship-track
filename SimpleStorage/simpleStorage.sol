//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract simpleStorage{
    uint256 favnum;


    function retrieve() public view returns{
         return favnum;
    }
}