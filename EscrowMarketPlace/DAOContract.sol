// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./escrowMarketplace.sol";

contract DaoContract {
    MarketPlace public marketplace;
    address public owner;

    uint256 public proposalCount;
    uint256 public membershipFee = 0.01 ether;
    uint256 public votingDuration = 3 days;

    struct Proposal {
        uint tradeId;
        address buyer;
        address seller;
        uint256 votesForBuyer;
        uint256 votesForSeller;
        uint256 startTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public isMember;
    mapping(uint => bool) public hasProposal;


    event MemberJoined(address member);
    event ProposalCreated(uint indexed proposalId, uint tradeId, address buyer, address seller);
    event Voted(uint indexed proposalId, address voter, bool favorBuyer);
    event ProposalExecuted(uint indexed proposalId, bool buyerWon);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyMember() {
        require(isMember[msg.sender], "Not a DAO member");
        _;
    }

    constructor(address _marketplace) {
        owner = msg.sender;
        marketplace = MarketPlace(_marketplace);
    }

    // ========== DAO MEMBERSHIP ==========

    function joinDAO() external payable {
        require(!isMember[msg.sender], "Already a member");
        require(msg.value >= membershipFee, "Need at least 0.01 ETH to join");
        isMember[msg.sender] = true;
        emit MemberJoined(msg.sender);
    }

    // ========== PROPOSAL CREATION ==========

    function createProposal(uint _tradeId) external onlyMember {
        // Get dispute data from marketplace
        (address buyer, address seller, string memory issue) = getDisputeFromMarketplace(_tradeId);
        require(bytes(issue).length > 0, "No active dispute for this trade");
        require(!hasProposal[_tradeId], "Proposal already exists for this trade");
        hasProposal[_tradeId] = true;


        Proposal storage p = proposals[proposalCount];
        p.tradeId = _tradeId;
        p.buyer = buyer;
        p.seller = seller;
        p.startTime = block.timestamp;

        emit ProposalCreated(proposalCount, _tradeId, buyer, seller);
        proposalCount++;
    }

    function getDisputeFromMarketplace(uint _tradeId) internal view returns (address, address, string memory) {
    (
        address buyer,
        address seller,
        string memory issue
    ) = marketplace.getDispute(_tradeId);
    return (buyer, seller, issue);
}

    // ========== VOTING ==========

    function vote(uint _proposalId, bool favorBuyer) external onlyMember {
        Proposal storage p = proposals[_proposalId];
        require(p.startTime > 0, "Proposal doesn't exist");
        require(!p.hasVoted[msg.sender], "Already voted");
        require(!p.executed, "Proposal already executed");
        require(block.timestamp <= p.startTime + votingDuration, "Voting period ended");

        p.hasVoted[msg.sender] = true;

        if (favorBuyer) {
            p.votesForBuyer++;
        } else {
            p.votesForSeller++;
        }

        emit Voted(_proposalId, msg.sender, favorBuyer);
    }

    // ========== EXECUTION ==========

    function executeProposal(uint _proposalId) external onlyOwner {
        Proposal storage p = proposals[_proposalId];
        require(p.startTime > 0, "Proposal doesn't exist");
        require(!p.executed, "Already executed");
        require(block.timestamp > p.startTime + votingDuration, "Voting still active");

        bool buyerWon = p.votesForBuyer > p.votesForSeller;
        p.executed = true;

        // Call marketplace to finalize dispute resolution
        marketplace.resolveDispute(p.buyer, p.seller, p.tradeId, buyerWon);

        emit ProposalExecuted(_proposalId, buyerWon);
    }

    // ========== OWNER FUNCTIONS ==========

    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
