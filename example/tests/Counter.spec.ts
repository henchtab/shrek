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

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    logger = new Logger(blockchain);

    counter = blockchain.openContract(await Counter.fromInit(0n));
    logger.addContract(counter, "Counter");

    deployer = await blockchain.treasury("Deployer");
    logger.addContract(deployer, "Deployer");

    const DeployResult = await counter.send(
      deployer.getSender(),
      {
        value: toNano("0.05"),
      },
      {
        $$type: "Deploy",
        queryId: 0n,
      },
    );
    logger.logTransactions(DeployResult.transactions, "Deploy");

    expect(DeployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: counter.address,
      deploy: true,
      success: true,
    });
  });

  it("should deploy", async () => {
    // the check is done inside beforeEach
    // blockchain and counter are ready to use
  });

  it("should increase counter", async () => {
    const increaseTimes = 3;
    for (let index = 0; index < increaseTimes; index++) {
      console.log(`increase ${index + 1}/${increaseTimes}`);

      const adder = await blockchain.treasury(`Adder #${index}`);
      logger.addContract(adder, `Adder #${index}`);

      const counterBefore = await counter.getCounter();

      console.log("counter before increasing", counterBefore);

      const increaseBy = BigInt(Math.floor(Math.random() * 100));

      console.log("increasing by", increaseBy);

      const AddResult = await counter.send(
        adder.getSender(),
        {
          value: toNano("0.05"),
        },
        {
          $$type: "Add",
          queryId: 0n,
          amount: increaseBy,
        },
      );
      logger.logTransactions(AddResult.transactions, `Add #${index}`);

      expect(AddResult.transactions).toHaveTransaction({
        from: adder.address,
        to: counter.address,
        success: true,
      });

      const counterAfter = await counter.getCounter();

      console.log("counter after increasing", counterAfter);

      expect(counterAfter).toBe(counterBefore + increaseBy);
    }
  });
});
