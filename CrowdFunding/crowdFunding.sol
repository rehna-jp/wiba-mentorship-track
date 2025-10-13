// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Users can create a fundraising campaign with a goal.
// Supporters can send ETH to fund the campaign.
// The owner can withdraw funds only if the goal is met.
// Contributors can get refunds if the goal isn’t reached.
//This teaches functions, condition checks, and handling ETH

contract Fundraiser{
    struct user{
        address userAddress;
        string name;
        string description;
        uint256 goal;
    }


    uint public deadline;
    user public owner;

    struct supporter{
        address supporterAddress;
        uint256 amount;
        string email;
    }

    supporter[] public supporterList;
    
    mapping(address => uint256) contributions;

   uint public totalFunds;
    function createCampaign(uint256 goal, uint256 durationInDays,string memory _name,string memory _description ) public {
       if (owner.userAddress != address(0)) {
            require(block.timestamp > deadline, "Existing campaign still active");
        }       
       deadline = block.timestamp + (durationInDays * 1 days);
       owner.userAddress = msg.sender;
       owner.goal = goal * 1 ether;
       owner.name = _name;
       owner.description = _description;

       totalFunds = 0;
       delete supporterList;
    }

    function fund(string memory _email) public payable{
        require(block.timestamp < deadline, "This campaign has ended");
        require(msg.value > 0 , "Send enough ETH");
        supporterList.push(supporter(msg.sender, msg.value, _email));
        contributions[msg.sender] += msg.value;
        totalFunds += msg.value;
    }

    function withdraw() public payable {
       require(msg.sender == owner.userAddress, "Not the owner of this crowdFunding");
       require(block.timestamp > deadline, "Campaign is still active");
       require(totalFunds > owner.goal,"Goal is not reached");

       uint amount = totalFunds;
       totalFunds = 0;
       payable(msg.sender).transfer(amount);
    }

    function refund() public payable{
        require(block.timestamp > deadline , "Campaign is still ongoing");
        require(totalFunds < owner.goal, "Goal was reached");
        uint256 amount = contributions[msg.sender];

        require(amount > 0, "Nothing to refund");

        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

}
