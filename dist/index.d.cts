import { Contract, Address, Transaction } from '@ton/core';
import { Blockchain, SandboxContract } from '@ton/sandbox';

declare class Logger {
    private blockchain;
    private contractLabels;
    constructor(blockchain: Blockchain);
    /**
     * Adds a contract label for easy identification.
     * @param contract The contract or address to label.
     * @param label The label to associate with the contract.
     */
    addContract<F extends Contract>(contract: SandboxContract<F> | Address | string, label: string): void;
    /**
     * Retrieves the label for a given contract address.
     * @param address The address of the contract.
     * @returns The label associated with the address or a shortened version of the address.
     */
    getContractLabel(address: Address): string;
    /**
     * Retrieves the balance for a given contract address.
     * @param address The address of the contract.
     * @returns The balance associated with the address.
     */
    getContractBalance(address: Address): Promise<bigint>;
    /**
     * Logs all contract balances.
     */
    logContracts(): Promise<void>;
    /**
     * Logs transactions to the console in a table format.
     * @param transactions The list of transactions to log.
     * @param info Optional info to log before the transactions.
     */
    logTransactions(transactions: Transaction[], info?: string): Promise<void>;
    /**
     * Formats a transaction into a readable object.
     * @param tx The transaction to format.
     * @returns A formatted transaction object or undefined if not applicable.
     */
    private formatTransaction;
    /**
     * Gets the address string from a contract, address, or string.
     * @param contract The contract or address.
     * @returns The address as a string.
     */
    private getAddressString;
    /**
     * Retrieves formatted contract data.
     * @returns The formatted contract data array.
     */
    private getContractData;
}
/**
 * Formats a coin value to a readable string, handling undefined or null values.
 * @param value The coin value to format.
 * @param precision The number of decimal places to display.
 * @returns The formatted coin value as a string or "N/A" if value is undefined or null.
 */
declare function formatCoins(value: bigint | undefined | null, precision?: number): string;

export { Logger, formatCoins };
