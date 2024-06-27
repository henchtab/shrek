import { Address, Contract, Transaction } from "@ton/core";
import { Blockchain, SandboxContract } from "@ton/sandbox";

export class Logger {
  private blockchain: Blockchain;
  private contractLabels: Map<string, string>;

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;
    this.contractLabels = new Map<string, string>();
  }

  /**
   * Adds a contract label for easy identification.
   * @param contract The contract or address to label.
   * @param label The label to associate with the contract.
   */
  addContract<F extends Contract>(
    contract: SandboxContract<F> | Address | string,
    label: string,
  ): void {
    const address = this.getAddressString(contract);

    if (this.contractLabels.has(address)) {
      throw new Error(
        `The '${address}' contract already has a '${label}' label!`,
      );
    }

    this.contractLabels.set(address, label);
  }

  /**
   * Retrieves the label for a given contract address.
   * @param address The address of the contract.
   * @returns The label associated with the address or a shortened version of the address.
   */
  getContractLabel(address: Address): string {
    return this.contractLabels.get(address.toString()) ||
      shortenString(address.toString());
  }

  /**
   * Retrieves the balance for a given contract address.
   * @param address The address of the contract.
   * @returns The balance associated with the address.
   */
  async getContractBalance(address: Address): Promise<bigint> {
    try {
      const contract = await this.blockchain.getContract(address);
      return contract.balance;
    } catch (error) {
      console.error("Error fetching contract balance:", error);
      throw error;
    }
  }

  /**
   * Logs all contract balances.
   */
  async logContracts(): Promise<void> {
    const data = await this.getContractData();
    console.table(data);
  }

  /**
   * Logs transactions to the console in a table format.
   * @param transactions The list of transactions to log.
   * @param info Optional info to log before the transactions.
   */
  async logTransactions(
    transactions: Transaction[],
    info?: string,
  ): Promise<void> {
    if (info) {
      console.info(info);
    }

    const formattedTransactions = await Promise.all(
      transactions.map((tx) => this.formatTransaction(tx)),
    );
    console.table(formattedTransactions.filter((tx) => tx !== undefined));
  }

  /**
   * Formats a transaction into a readable object.
   * @param tx The transaction to format.
   * @returns A formatted transaction object or undefined if not applicable.
   */
  private async formatTransaction(
    tx: Transaction,
  ): Promise<object | undefined> {
    if (tx.description.type !== "generic") {
      return undefined;
    }

    const body = tx.inMessage?.info.type === "internal"
      ? tx.inMessage.body?.beginParse()
      : undefined;
    const op = body && body.remainingBits >= 32
      ? body.preloadUint(32)
      : "0gR33n0gr";

    const source = tx.inMessage?.info.src;
    let sourceLabel = "Shrek";

    if (source && Address.isAddress(source)) {
      sourceLabel = this.getContractLabel(source);
    }

    const destination = tx.inMessage?.info.dest;
    let destinationLabel = "Donkey";

    if (destination && Address.isAddress(destination)) {
      destinationLabel = this.getContractLabel(destination);
    }

    return {
      "Source": sourceLabel,
      "Destination": destinationLabel,
      "Type": tx.inMessage?.info.type,
      "Opcode": typeof op === "number" ? "0x" + op.toString(16) : op,
      "Incoming Value": formatCoins(
        tx.inMessage?.info.type === "internal"
          ? tx.inMessage.info.value.coins
          : undefined,
      ),
      "Outgoing Value": tx.outMessages.values().length == 0
        ? "No coins!"
        : tx.outMessages.values().filter((msg) => msg.info.type === "internal")
          // @ts-expect-error
          .map((msg) => formatCoins(msg.info.value.coins)),
      "Total Fees": formatCoins(tx.totalFees.coins),
      "Outgoing Actions Count": tx.description.actionPhase?.totalActions ??
        "No actions here?",
      "Exit Code": tx.description.computePhase.type === "vm"
        ? tx.description.computePhase.exitCode
        : "Ogres have layers?",
    };
  }

  /**
   * Gets the address string from a contract, address, or string.
   * @param contract The contract or address.
   * @returns The address as a string.
   */
  private getAddressString<F extends Contract>(
    contract: SandboxContract<F> | Address | string,
  ): string {
    if (typeof contract === "object" && "address" in contract) {
      return (contract as SandboxContract<F>).address.toString();
    } else if (typeof contract === "string") {
      return contract;
    } else {
      return contract.toString();
    }
  }

  /**
   * Retrieves formatted contract data.
   * @returns The formatted contract data array.
   */
  private async getContractData(): Promise<
    { Contract: string; "Contract Balance": string }[]
  > {
    const data: { "Contract": string; "Contract Balance": string }[] = [];

    for (const [addressAsString, label] of this.contractLabels) {
      const address = Address.parse(addressAsString);
      const balance = await this.getContractBalance(address);

      data.push({
        "Contract": label,
        "Contract Balance": formatCoins(balance),
      });
    }

    return data;
  }
}

/**
 * Shortens a string to the first and last 4 characters, separated by ellipses.
 * @param str The string to shorten.
 * @returns The shortened string.
 */
function shortenString(str: string): string {
  return str.length <= 8 ? str : `${str.slice(0, 4)}...${str.slice(-4)}`;
}

const decimalCount = 9;
const decimal = pow10(decimalCount);

/**
 * Calculates 10 raised to the power of n.
 * @param n The exponent.
 * @returns The value of 10^n as a bigint.
 */
function pow10(n: number): bigint {
  let v = 1n;
  for (let i = 0; i < n; i++) {
    v *= 10n;
  }
  return v;
}

/**
 * Formats a coin value to a readable string with a given precision.
 * @param value The coin value to format.
 * @param precision The number of decimal places to display.
 * @returns The formatted coin value as a string.
 */
function formatCoinsPure(value: bigint, precision = 6): string {
  let whole = value / decimal;
  let frac = value % decimal;
  const precisionDecimal = pow10(decimalCount - precision);

  if (frac % precisionDecimal > 0n) {
    frac += precisionDecimal;
    if (frac >= decimal) {
      frac -= decimal;
      whole += 1n;
    }
  }
  frac /= precisionDecimal;

  return `${whole.toString()}${
    frac !== 0n
      ? "." + frac.toString().padStart(precision, "0").replace(/0+$/, "")
      : ""
  }`;
}

/**
 * Formats a coin value to a readable string, handling undefined or null values.
 * @param value The coin value to format.
 * @param precision The number of decimal places to display.
 * @returns The formatted coin value as a string or "N/A" if value is undefined or null.
 */
export function formatCoins(
  value: bigint | undefined | null,
  precision = 6,
): string {
  return value === undefined || value === null
    ? "∞"
    : formatCoinsPure(value, precision);
}
