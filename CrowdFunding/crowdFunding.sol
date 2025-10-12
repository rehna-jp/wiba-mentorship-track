// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


// Users can create a fundraising campaign with a goal.
// Supporters can send ETH to fund the campaign.
// The owner can withdraw funds only if the goal is met.
// Contributors can get refunds if the goal isn’t reached.

contract Fundraiser{
    struct user{
        address userAddress;
        uint256 goal;
    }

    user public owner;

    struct supporter{
        address supporterAddress;
        uint256 amount;
    }

    supporter[] public supporterList;
    
    mapping(address => uint256) contributions;

   uint public totalFunds;
    function createCampaign(uint256 goal) public {
       require(owner.userAddress == address(0),"Campaign already exists");
       owner.userAddress = msg.sender;
       owner.goal = goal * 1 ether;
    }

    function fund() public payable{
        require(msg.value > 0 , "Send enough ETH");
        supporterList.push(supporter(msg.sender, msg.value));
        contributions[msg.sender] += msg.value;
        totalFunds += msg.value;
    }

    function withdraw() public payable {
       require(msg.sender == owner.userAddress, "Not the owner of this crowdFunding");
       require(totalFunds > owner.goal,"Goal is not reached");

       uint amount = totalFunds;
       totalFunds = 0;
       payable(msg.sender).transfer(amount);
    }

    function refund() public payable{
        require(totalFunds < owner.goal, "Goal was reached");
        uint256 amount = contributions[msg.sender];

        require(amount > 0, "Nothing to refund");

        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

}
