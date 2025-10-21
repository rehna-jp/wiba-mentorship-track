// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Token {

    address owner;
    string public name = "MyToken";
    string public symbol = "MYT";
    uint public decimals = 18;
    uint public totalSupply;

    constructor(uint _initialSupply){
        owner = msg.sender;
        totalSupply = _initialSupply * 10 ** uint(decimals);
        balances[owner] = totalSupply;
    }

    mapping (address => uint)  balances;
    
    event TokensMinted(address indexed  to, uint amount);
    event TokenTransferred(address indexed  from, address indexed  to, uint amount);

    function mintTokens(address to, uint256 _amount) public{
        require(msg.sender == owner, "You cannot mint these tokens");
         balances[to] += _amount;
         totalSupply += _amount;

         emit TokensMinted(to, _amount);
    }

    function transfer(address to, uint amount) public{
        require(balances[msg.sender] >= amount, "You do not have enough tokens");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;

        emit TokenTransferred(msg.sender, to, amount);

    }

    function showbalance(address account) public view returns(uint256){
        return balances[account];
    }


}