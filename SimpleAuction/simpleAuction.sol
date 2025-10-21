// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract simpleAuction {
    address owner;

    constructor(){
        owner = msg.sender;
    }

    struct bidder{
        uint amount;
        address bidderAddress;
    }

    bidder[] biddersList;

    mapping (address => bidder) bidders;

    uint highestBid = 0;
    address highestBidder;

    event SuccessfulBid(address indexed bidderAddress, uint amount);
    event AuctionEnded(address indexed owner, uint highestBid);
    event Bidwithdrawn(address indexed bidderAddress, uint amount);

    function bid() external payable{
         require(msg.value > 1 ether, "Bid amount must be atleast 1 ETH");
         require(msg.value > highestBid, "Bid amount must be higher than the previous bid");

         bidders[msg.sender] = bidder({
            amount: msg.value,
            bidderAddress: msg.sender
         });

         biddersList.push(bidders[msg.sender]);
         
         highestBid = msg.value;
         highestBidder = msg.sender;

         emit SuccessfulBid(msg.sender, msg.value);
    }

    function getHighestBidder() public view returns(bidder memory){
          return bidder({
            amount: highestBid,
            bidderAddress: highestBidder
            });
    }

    bool endedAuction = false;

    function endAuction() external payable{
        require(msg.sender == owner, "Only owner can end this Auction");
        require(!endedAuction, "Auction has already ended");
        payable (owner).transfer(highestBid);

        endedAuction = true;

        emit AuctionEnded(owner, highestBid);
    }

    function withdrawBid() external payable{
        bidder storage b = bidders[msg.sender];
        require(endedAuction == true, "Auction has not ended yet");
        require(b.amount > 0, "You have not placed a bid");
        require(msg.sender != highestBidder, "You are not qualified to withdraw");
         
         uint amount = b.amount;
         b.amount = 0;

         payable (msg.sender).transfer(amount);
         

         emit Bidwithdrawn(msg.sender,amount);
    }
}