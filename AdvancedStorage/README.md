 AdvancedStorage Smart Contract
 Overview

The AdvancedStorage smart contract is a simple Solidity contract designed to store, retrieve, and reset a single unsigned integer value on the Ethereum blockchain.
It introduces access control by restricting the reset functionality to only the contract owner.

⚙️ Features

Store a number on the blockchain

Retrieve the currently stored number

Reset the stored number (restricted to the owner)

Ownership protection using the onlyOwner modifier