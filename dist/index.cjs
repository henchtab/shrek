var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Logger: () => Logger,
  formatCoins: () => formatCoins
});
module.exports = __toCommonJS(src_exports);
var import_core = require("@ton/core");
var Logger = class {
  blockchain;
  contractLabels;
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.contractLabels = /* @__PURE__ */ new Map();
  }
  /**
   * Adds a contract label for easy identification.
   * @param contract The contract or address to label.
   * @param label The label to associate with the contract.
   */
  addContract(contract, label) {
    const address = this.getAddressString(contract);
    if (this.contractLabels.has(address)) {
      throw new Error(
        `The '${address}' contract already has a '${label}' label!`
      );
    }
    this.contractLabels.set(address, label);
  }
  /**
   * Retrieves the label for a given contract address.
   * @param address The address of the contract.
   * @returns The label associated with the address or a shortened version of the address.
   */
  getContractLabel(address) {
    return this.contractLabels.get(address.toString()) || shortenString(address.toString());
  }
  /**
   * Retrieves the balance for a given contract address.
   * @param address The address of the contract.
   * @returns The balance associated with the address.
   */
  async getContractBalance(address) {
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
  async logContracts() {
    const data = await this.getContractData();
    console.table(data);
  }
  /**
   * Logs transactions to the console in a table format.
   * @param transactions The list of transactions to log.
   * @param info Optional info to log before the transactions.
   */
  async logTransactions(transactions, info) {
    if (info) {
      console.info(info);
    }
    const formattedTransactions = await Promise.all(
      transactions.map((tx) => this.formatTransaction(tx))
    );
    console.table(formattedTransactions.filter((tx) => tx !== void 0));
  }
  /**
   * Formats a transaction into a readable object.
   * @param tx The transaction to format.
   * @returns A formatted transaction object or undefined if not applicable.
   */
  async formatTransaction(tx) {
    if (tx.description.type !== "generic") {
      return void 0;
    }
    const body = tx.inMessage?.info.type === "internal" ? tx.inMessage.body?.beginParse() : void 0;
    const op = body && body.remainingBits >= 32 ? body.preloadUint(32) : "0gR33n0gr";
    const source = tx.inMessage?.info.src;
    let sourceLabel = "Shrek";
    if (source && import_core.Address.isAddress(source)) {
      sourceLabel = this.getContractLabel(source);
    }
    const destination = tx.inMessage?.info.dest;
    let destinationLabel = "Donkey";
    if (destination && import_core.Address.isAddress(destination)) {
      destinationLabel = this.getContractLabel(destination);
    }
    return {
      "Source": sourceLabel,
      "Destination": destinationLabel,
      "Type": tx.inMessage?.info.type,
      "Opcode": typeof op === "number" ? "0x" + op.toString(16) : op,
      "Incoming Value": formatCoins(
        tx.inMessage?.info.type === "internal" ? tx.inMessage.info.value.coins : void 0
      ),
      "Outgoing Value": tx.outMessages.values().length == 0 ? "No coins!" : tx.outMessages.values().filter((msg) => msg.info.type === "internal").map((msg) => formatCoins(msg.info.value.coins)),
      "Total Fees": formatCoins(tx.totalFees.coins),
      "Outgoing Actions Count": tx.description.actionPhase?.totalActions ?? "No actions here?",
      "Exit Code": tx.description.computePhase.type === "vm" ? tx.description.computePhase.exitCode : "Ogres have layers?"
    };
  }
  /**
   * Gets the address string from a contract, address, or string.
   * @param contract The contract or address.
   * @returns The address as a string.
   */
  getAddressString(contract) {
    if (typeof contract === "object" && "address" in contract) {
      return contract.address.toString();
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
  async getContractData() {
    const data = [];
    for (const [addressAsString, label] of this.contractLabels) {
      const address = import_core.Address.parse(addressAsString);
      const balance = await this.getContractBalance(address);
      data.push({
        "Contract": label,
        "Contract Balance": formatCoins(balance)
      });
    }
    return data;
  }
};
function shortenString(str) {
  return str.length <= 8 ? str : `${str.slice(0, 4)}...${str.slice(-4)}`;
}
var decimalCount = 9;
var decimal = pow10(decimalCount);
function pow10(n) {
  let v = 1n;
  for (let i = 0; i < n; i++) {
    v *= 10n;
  }
  return v;
}
function formatCoinsPure(value, precision = 6) {
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
  return `${whole.toString()}${frac !== 0n ? "." + frac.toString().padStart(precision, "0").replace(/0+$/, "") : ""}`;
}
function formatCoins(value, precision = 6) {
  return value === void 0 || value === null ? "\u221E" : formatCoinsPure(value, precision);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Logger,
  formatCoins
});
//# sourceMappingURL=index.cjs.map