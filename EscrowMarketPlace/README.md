🏛️ DAO-Powered Dispute Resolution Marketplace

A decentralized marketplace with an integrated DAO-based dispute resolution system — empowering community governance and fairness in peer-to-peer trades.

🚀 Overview

This project combines two smart contracts:

Marketplace Contract – Handles trade creation, escrow management, and dispute initiation between buyers and sellers.

DAO Contract – Governs dispute resolutions through decentralized voting by DAO members.

When a dispute arises between a buyer and seller, it’s escalated to the DAO, where members vote to determine who wins the case. The outcome is executed automatically on-chain by the Marketplace contract.

🧩 Features
🛒 Marketplace Contract

Create trades between buyers and sellers.

Escrow mechanism to hold funds securely.

Ability to raise disputes for unresolved trades.

Integrates with DAO contract for community-driven resolutions.

Automatically releases funds to the winning party.

🗳️ DAO Contract

Allows DAO members to vote on disputes.

Executes proposals after the voting period ends.

Automatically calls the Marketplace contract to finalize dispute outcomes.

Transparent, auditable, and trustless decision process.

⚙️ Smart Contract Flow

Trade Creation:
Buyer initiates a trade and deposits funds into escrow.

Dispute Raised:
If issues occur, either party can raise a dispute.
A proposal is created in the DAO contract.

Voting Phase:
DAO members vote for either the buyer or the seller.

Proposal Execution:
After the voting duration elapses, the DAO executes the proposal.
The DAO calls marketplace.resolveDispute(...) with the voting result.

Funds Released:

If buyer wins → funds are refunded.

If seller wins → funds are released to the seller.

🔐 Key Functions
Marketplace.sol
Function	Description
createTrade(address _seller)	Buyer starts a trade and locks funds in escrow.
raiseDispute(uint _tradeId)	Either party raises a dispute for DAO review.
resolveDispute(address _buyer, address _seller, uint _tradeId, bool buyerWon)	Finalizes the dispute based on DAO outcome (only callable by DAO).
DAO.sol
Function	Description
createProposal(address _buyer, address _seller, uint _tradeId)	Creates a new dispute proposal.
vote(uint _proposalId, bool voteForBuyer)	DAO members cast votes for buyer or seller.
executeProposal(uint _proposalId)	Executes the proposal after voting period and calls Marketplace to resolve the dispute.
⏳ Voting Rules

Each proposal has a fixed voting duration (e.g., 3 days).

Votes can be cast only once per member.

Proposal can only be executed after the voting duration ends.

Voting outcome:

More votes for buyer → buyer wins

More votes for seller → seller wins