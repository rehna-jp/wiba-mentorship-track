// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./daoContract.sol";

contract MarketPlace{

    enum tradeStatus{
    pending, accepted ,completed, disputed, resolved
}
     
struct trade{
    uint id;
    address seller;
    string itemDescription;
    uint256 price;
}

struct buyerTrade{
    address buyer;
    address seller;
    uint256 amount;
}

struct dispute{
    address buyer;
    address seller;
    string  issue;
}

struct tradeView{
    uint256 id;
    address seller;
    string itemDescription;
    uint256 price;
    tradeStatus status;
}

trade[] traders;

uint256 tradeId;

mapping (uint256 => trade) trades;

mapping (uint256 => buyerTrade) buyerTraders;

mapping (uint256 => dispute) disputes;

mapping (uint256 => tradeStatus) tradeStatuses;

address public arbitrator; 
DaoContract public daoContract;
bool private locked;

event TradeCreated(address indexed seller, string itemDescription, uint price);
event TradeAccepted(address indexed buyer, uint price);
event TradeCompleted(address indexed buyer, address indexed seller, uint amount);
event DisputeCreated(address indexed buyer, address indexed seller, string issue);
event DisputeResolved(address indexed buyer, address indexed seller );

constructor() {
    arbitrator = msg.sender; // initially deployer; can be updated later
}

function getDispute(uint _tradeId) external view returns (address, address, string memory) {
    dispute storage d = disputes[_tradeId];
    return (d.buyer, d.seller, d.issue);
}



modifier onlySeller(uint _tradeId){
    require(msg.sender == trades[_tradeId].seller, "Only seller can call this function");
    _;
}

modifier  onlyBuyer(uint _tradeId){
    require(msg.sender == buyerTraders[_tradeId].buyer, "Only buyer can call this function");
    _;
}

 modifier noReentrancy() {
        require(!locked, "Reentrant");
        locked = true;
        _;
        locked = false;
 }
  modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Only DAO arbitrator can call this");
        _;
}

 function setDAO(address _dao) external {
        require(msg.sender == arbitrator, "Only arbitrator can set DAO");
        daoContract = DaoContract(_dao);
    }

 function setArbitrator(address _dao) external {
        require(msg.sender == arbitrator, "Only current arbitrator can update");
        arbitrator = _dao;
    }

function createTrade(string memory _itemDescription, uint _price) public {
   
    trades[tradeId] = trade({
        id: tradeId,
       seller: msg.sender,
       itemDescription: _itemDescription,
       price: _price
    });
    tradeStatuses[tradeId] = tradeStatus.pending;
    traders.push(trades[tradeId]);
    emit TradeCreated(msg.sender, _itemDescription, _price);
    tradeId++;

    
}

function viewAllTrades() public view returns(tradeView[] memory ){
     tradeView[] memory allTrades = new tradeView[](tradeId);

     for(uint i = 0; i < tradeId; i++){
        trade storage t = trades[i];
        allTrades[i] = tradeView({
            id: t.id,
            seller: t.seller,
            itemDescription: t.itemDescription,
            price: t.price,
            status: tradeStatuses[t.id]
        });
     }
     return allTrades;
}


function acceptTrade(uint _tradeId) public {
    trade storage t = trades[_tradeId];
    require(tradeStatuses[_tradeId] == tradeStatus.pending, "This trade is not pending");
    require(buyerTraders[_tradeId].buyer == address(0), "Trade already accepted by another buyer");
    require(msg.sender != t.seller, "A seller can't accept this trade");



    buyerTraders[_tradeId] = buyerTrade({
        buyer: msg.sender,
        seller: t.seller,
        amount: 0
    });

    tradeStatuses[_tradeId] = tradeStatus.accepted;
    emit TradeAccepted(msg.sender, t.price);
    

}

function completeTrade(uint _tradeId) public payable onlyBuyer(_tradeId) noReentrancy{
    trade storage t = trades[_tradeId];
    require(msg.value == t.price, "Amount must be equal to the specified price");
    require(tradeStatuses[_tradeId] == tradeStatus.accepted, "Trade not accepted yet");
    require(disputes[_tradeId].buyer == address(0), "This action can't complete since this trade has been disputed");

    buyerTraders[_tradeId] = buyerTrade({
        buyer: msg.sender,
        seller: t.seller,
        amount: msg.value
    });
    tradeStatuses[_tradeId] = tradeStatus.completed;

     emit TradeCompleted(msg.sender, t.seller, msg.value);
    
    payable(t.seller).transfer(msg.value);

   
}

function createDispute(string memory detailedIssue, uint256 _tradeId) public onlyBuyer(_tradeId){
    trade storage t = trades[_tradeId];
    require( disputes[_tradeId].buyer == address(0), "Dispute for this trade has already been created");
    disputes[_tradeId] = dispute({
        buyer: msg.sender,
        seller: t.seller,
        issue: detailedIssue
    });
    tradeStatuses[_tradeId] = tradeStatus.disputed;
    emit DisputeCreated(msg.sender, t.seller, detailedIssue);

     if (address(daoContract) != address(0)) {
            daoContract.createProposal(_tradeId);
     }
}

function resolveDispute(address _buyer, address _seller, uint _tradeId, bool buyerWon)
        external
        onlyArbitrator
    {
        tradeStatuses[_tradeId] = tradeStatus.resolved;

        // logic to handle outcome:
        if (buyerWon) {
            // refund buyer
            payable(_buyer).transfer(buyerTraders[_tradeId].amount);
        } else {
            // pay seller
            payable(_seller).transfer(buyerTraders[_tradeId].amount);
        }

        emit DisputeResolved(_buyer, _seller);
    }



}
