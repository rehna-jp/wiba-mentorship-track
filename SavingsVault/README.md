SavingsVault is a decentralized savings management contract built with Solidity.
It allows users (clients) to create vault accounts, deposit and withdraw funds, and view balances — while the owner can open or close the vault to control activity.

This project demonstrates key Solidity concepts including:

Structs

Enums

Events

Modifiers

Payable functions

Mappings and arrays

Contract ownership and access control

✨ Features

🔐 Vault Management: Owner can open or close the vault using a single toggle function.

👥 Client Accounts: Each user can create their own savings account.

💰 Deposits & Withdrawals: Users can safely deposit and withdraw ETH from the vault.

🧾 Balance Tracking: View individual balances and the total amount saved in the vault.

🔊 Events: Every deposit, withdrawal, and vault status change is recorded on the blockchain.

🚫 Access Control: Only the contract owner can view the total vault balance or change the vault status.