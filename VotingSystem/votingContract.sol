// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


//add names
//allow users to vote 
//track and display total votes
//prevent users from voting twice


contract votingContract{
    

    struct user {
        string name;
        uint256 vote;
        
    }

    user[] public userlist;

    

    mapping(address => bool) public hasVoted;

    function addName(string memory _name) public {
        userlist.push(user(_name,0));
    }

    function addvote(uint256 voterId) public  {
        require(!hasVoted[msg.sender], "Already voted");
        require(voterId < userlist.length, "Not a qualified candidate");
            userlist[voterId].vote++;
            hasVoted[msg.sender] = true;
       

    }

    function numVotes() public view returns (uint ) {
        uint256 totvotes = 0;
        for (uint256 i = 0; i < userlist.length; i++){
            totvotes += userlist[i].vote;
        }
        return  totvotes;
    }

    
}