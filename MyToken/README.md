Token is a simple Solidity-based token contract that demonstrates the core functionalities of a basic ERC-20–like token.
It allows minting new tokens, transferring tokens between users, and checking wallet balances — all while maintaining ownership control.

This project was built as a foundational exercise to understand how tokens are created and managed on the Ethereum blockchain.

⚙️ Features

 Minting: The owner can mint (create) new tokens.
 Transfers: Any user can send tokens to another address.
 Balance Tracking: Users can check their token balance.
 Ownership Control: Only the contract owner can mint tokens.
 Events: Logs token transfers and minting for transparency.

🧱 Smart Contract Structure
1. Contract Initialization
constructor(uint _initialSupply)


Runs once when the contract is deployed.

Sets the deployer as the owner.

Mints an initial supply of tokens to the owner’s wallet.

The total supply is scaled by 10 ** 18 to support decimal precision (like Ether).

2. Minting Tokens
function mintTokens(address to, uint256 _amount) public


Who can call: Only the owner.

Purpose: Creates new tokens and adds them to a specified address.

Effect: Increases both the address balance and the total supply.

Event: Emits TokensMinted.

3. Transferring Tokens
function transfer(address to, uint amount) public


Who can call: Any user with enough balance.

Purpose: Transfers tokens from the caller to another user.

Effect: Moves tokens between accounts without changing total supply.

Event: Emits TokenTransferred.

4. Checking Balances
function showbalance(address account) public view returns(uint256)


Returns the raw token balance (in smallest units, like wei).