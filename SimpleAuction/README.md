 Simple Auction Smart Contract
 Overview

The Simple Auction smart contract allows users to participate in a decentralized auction on the Ethereum blockchain.
Participants can place bids using Ether (ETH), view the current highest bidder, and withdraw their funds if they do not win.
Only the contract owner can end the auction and claim the highest bid.

⚙️ Features

Owner-controlled auction — Only the contract deployer can end the auction.

Place bids — Users can submit bids higher than the current highest.

Track highest bid and bidder — The contract stores the current leading bid.

Manual withdrawals — Losing bidders can withdraw their bids manually.

Secure logic — Prevents re-bidding with smaller amounts and multiple auction endings.


🧠 How It Works

Auction creation

The auction starts when the contract is deployed.

The deployer automatically becomes the owner.

Placing a bid

Any user can call the bid() function and send Ether along with the transaction.

Each new bid must be greater than the previous highest bid.

The contract updates the highest bid and bidder accordingly.

Ending the auction

Only the owner can call endAuction().

When called, the highest bid amount is transferred to the owner’s wallet.

The auction is marked as ended to prevent multiple withdrawals.

Withdrawing losing bids

Users who didn’t win can call withdrawBid() to get their Ether back.

The highest bidder (winner) cannot withdraw their bid.

🧩 Smart Contract Structure
Function	Description
constructor()	Sets the deployer as the auction owner.
bid()	Allows users to place bids (must be higher than current highest).
getHighestBidder()	Returns the current highest bidder and bid amount.
endAuction()	Ends the auction, transfers highest bid to owner, and marks auction as closed.
withdrawBid()	Allows losing bidders to withdraw their funds manually.

⚠️ Important Rules

Minimum bid amount is 1 ETH.

Each new bid must be higher than the current highest bid.

The highest bidder cannot withdraw their bid.

The owner can end the auction only once.

🧪 Testing the Contract (Using Remix IDE)

Go to Remix IDE

Create a new file named simpleAuction.sol.

Paste the contract code.

Compile the contract with Solidity version 0.8.24.

Deploy the contract — you’ll become the owner automatically.

To test:

Use different accounts in Remix to place bids.

Use getHighestBidder() to check who’s leading.

After all bids, call endAuction() from the owner account.

Then try withdrawBid() from losing bidder accounts to confirm refunds.

🧾 Events
Event	                                                    Description
SuccessfulBid(address bidderAddress, uint amount)	-Emitted when a new valid bid is placed.
AuctionEnded(address owner, uint highestBid)	-Emitted when the auction ends successfully.
BidWithdrawn(address bidderAddress, uint amount)	-Emitted when a losing bidder withdraws funds.