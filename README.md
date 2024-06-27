# Shrek's Logger

The `Logger` class is a utility for logging information about contracts and
transactions within a blockchain environment. It provides functionalities to
label contracts, retrieve balances, and format transactions for easy
readability.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
   - [Initialization](#initialization)
   - [Adding Contract Labels](#adding-contract-labels)
   - [Retrieving Contract Labels](#retrieving-contract-labels)
   - [Getting Contract Balances](#getting-contract-balances)
   - [Logging Contract Balances](#logging-contract-balances)
   - [Logging Transactions](#logging-transactions)
3. [Helper Functions](#helper-functions)

## Installation

Before using the `Logger` class, ensure you have the required dependencies
installed:

```bash
npm install @henchtab/shrek
```

## Usage

### Initialization

First, import the required modules and initialize the `Logger` class:

```typescript
import { Blockchain } from "@ton/core";
import { Logger } from "@henchtab/shrek";

// Initialize the blockchain object (assuming it is already configured)
const blockchain = new Blockchain(/* configuration */);

// Initialize the Logger
const logger = new Logger(blockchain);
```

### Adding Contract Labels

You can add labels to contracts for easy identification. This is useful when you
want to refer to contracts by human-readable names rather than their addresses.

```typescript
// Add a label to a contract
const contractAddress = "kQ..."; // Replace with actual address
logger.addContract(contractAddress, "MyContractLabel");
```

### Retrieving Contract Labels

To retrieve the label associated with a contract, use the `getContractLabel`
method:

```typescript
const address = Address.parse("kQ..."); // Replace with actual address
const label = logger.getContractLabel(address);
console.log(label); // Output: MyContractLabel or shortened address
```

### Getting Contract Balances

Retrieve the balance of a contract using the `getContractBalance` method:

```typescript
const address = Address.parse("kQ..."); // Replace with actual address.
logger.getContractBalance(address).then((balance) => {
  console.log(`Balance: ${balance}`);
}).catch((error) => {
  console.error("Error fetching contract balance:", error);
});
```

### Logging Contract Balances

To log all contract balances with their associated labels:

```typescript
logger.logContracts().then(() => { // https://github.com/henchtab/shrek/blob/main/example/tests/Counter.spec.ts#L112
  console.log("Contract balances logged.");
});
```

### Logging Transactions

To log transactions in a readable format:

```typescript
const transactions = [/* Array of transactions */]; // https://github.com/henchtab/shrek/blob/main/example/tests/Counter.spec.ts#L35
logger.logTransactions(transactions, "Transaction log:").then(() => {
  console.log("Transactions logged.");
});
```

## Helper Functions

The `Logger` class includes several helper functions to assist with common
tasks:

- **shortenString(str: string): string**
  - Shortens a string to the first and last 4 characters, separated by ellipses.

- **pow10(n: number): bigint**
  - Calculates 10 raised to the power of `n`.

- **formatCoins(value: bigint | undefined | null, precision = 6): string**
  - Formats a coin value to a readable string with a specified precision.
    Handles undefined or null values by returning `"∞"`.

### Example:

```typescript
import { formatCoins, shortenString } from "@henchtab/shreak";

const longString = "1234567890abcdef";
console.log(shortenString(longString)); // Output: 1234...cdef

const coinValue = 123456789n;
console.log(formatCoins(coinValue)); // Output: 123.456789 (depending on precision)
```
