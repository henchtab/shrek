import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { toNano } from "@ton/core";
import { Counter } from "../wrappers/Counter";
import "@ton/test-utils";
import { Logger } from "@henchtab/shrek";

describe("Counter", () => {
  let blockchain: Blockchain;
  let deployer: SandboxContract<TreasuryContract>;
  let counter: SandboxContract<Counter>;
  let logger: Logger;

  /**
   * Initializes the blockchain and contracts.
   * @async
   * @function initializeBlockchainAndContracts
   * @returns {Promise<void>} A promise that resolves when the initialization is complete.
   */
  const initializeBlockchainAndContracts = async () => {
    blockchain = await Blockchain.create();
    logger = new Logger(blockchain);

    counter = blockchain.openContract(await Counter.fromInit(0n));
    logger.addContract(counter, "Counter");

    deployer = await blockchain.treasury("Deployer");
    logger.addContract(deployer, "Deployer");

    const deployResult = await counter.send(
      deployer.getSender(),
      { value: toNano("0.05") },
      { $$type: "Deploy", queryId: 0n },
    );
    logger.logTransactions(deployResult.transactions, "Deploy");

    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: counter.address,
      deploy: true,
      success: true,
    });
  };

  /**
   * Increases the counter by a random amount.
   * @async
   * @function increaseCounter
   * @param {number} index - The index of the adder.
   * @returns {Promise<void>} A promise that resolves when the counter is increased.
   */
  const increaseCounter = async (index: number) => {
    const adder = await blockchain.treasury(`Adder #${index}`);
    logger.addContract(adder, `Adder #${index}`);

    const counterBefore = await counter.getCounter();
    console.log(`counter before increasing: ${counterBefore}`);

    const increaseBy = BigInt(Math.floor(Math.random() * 100));
    console.log(`increasing by: ${increaseBy}`);

    const addResult = await counter.send(
      adder.getSender(),
      { value: toNano("0.05") },
      { $$type: "Add", queryId: 0n, amount: increaseBy },
    );
    logger.logTransactions(addResult.transactions, `Add #${index}`);

    expect(addResult.transactions).toHaveTransaction({
      from: adder.address,
      to: counter.address,
      success: true,
    });

    const counterAfter = await counter.getCounter();
    console.log(`counter after increasing: ${counterAfter}`);

    expect(counterAfter).toBe(counterBefore + increaseBy);
  };

  /**
   * Runs before each test to initialize the blockchain and deploy the contract.
   * @function beforeEach
   * @returns {Promise<void>} A promise that resolves when the setup is complete.
   */
  beforeEach(async () => {
    await initializeBlockchainAndContracts();
  });

  /**
   * Test to verify that the contract is deployed successfully.
   * @function it
   * @name should deploy
   * @returns {Promise<void>} A promise that resolves when the test is complete.
   */
  it("should deploy", async () => {
    // The check is done inside beforeEach
    // Blockchain and counter are ready to use
  });

  /**
   * Test to verify that the counter increases correctly.
   * @function it
   * @name should increase counter
   * @returns {Promise<void>} A promise that resolves when the test is complete.
   */
  it("should increase counter", async () => {
    const increaseTimes = 3;
    for (let index = 0; index < increaseTimes; index++) {
      console.log(`increase ${index + 1}/${increaseTimes}`);
      await increaseCounter(index);
    }
    await logger.logContracts();
  });
});
