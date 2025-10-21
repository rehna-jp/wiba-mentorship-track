// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract savingsVault{
    struct client{
        address clientAddress;
        string name;
        uint256 amount;
    }
    
    address  owner ;

    enum vaultStatus{
        Active, Closed
    }

    vaultStatus  status;

    constructor(){
        owner = msg.sender;
        status = vaultStatus.Active;
    }

    uint256  totalAmount ;

    client[] public clientList;
    mapping (address => uint256) public addressToAmountsaved;

    mapping (address => bool) public hasVaultAccount;

    event depositMade(address indexed client, uint256 amount);
    event withdrawalAllowed(address indexed  client, uint256 amount);
    event vaultChanged(address indexed  owner);

     function createVaultAccount( string memory _name) public{
         require(!hasVaultAccount[msg.sender], "Account already exists");
         clientList.push(client(msg.sender, _name, addressToAmountsaved[msg.sender]));
         
     }

     function deposit() public payable vaultIsActive{
        addressToAmountsaved[msg.sender] += msg.value;
        totalAmount += msg.value ;
        emit depositMade(msg.sender, msg.value);
     }

     function withdraw(uint256 _withdrawalAmount) public payable vaultIsActive {
        require(addressToAmountsaved[msg.sender] >= _withdrawalAmount, "Insufficient funds in Savings Account");
        addressToAmountsaved[msg.sender] -= _withdrawalAmount;
        totalAmount -= _withdrawalAmount;
        payable(msg.sender).transfer(_withdrawalAmount); 
        emit withdrawalAllowed(msg.sender, _withdrawalAmount);
     }

     function viewBalance() onlyOwner public view returns(uint256){
        return totalAmount;
     }

     function viewMyBalance() public view returns(uint256){
        return  addressToAmountsaved[msg.sender];
     }

     function changeVaultStatus() public onlyOwner{
           if (status == vaultStatus.Active){
            status = vaultStatus.Closed;}
            else{
                status = vaultStatus.Active;
            }
            emit vaultChanged(msg.sender);
     }

     function checkStatus() public view returns(string memory){
            if (status == vaultStatus.Active){
                return "The Vault is Open";
            } else {
                return "The Vault is Closed";
            }
     
     }

     modifier onlyOwner{
        require(msg.sender == owner, "Cannot complete this action, You do not own this Contract");
        _;
     }

     modifier vaultIsActive{
        require(status == vaultStatus.Active, "The Storage Vault is closed at the moment");
        _;
     }
}