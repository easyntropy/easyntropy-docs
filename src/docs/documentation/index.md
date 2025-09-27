# Documentation

Easyntropy is a randomness oracle that supplies Solidity contracts with secure `bytes32` seeds.

### Installation

1. Install the package

Download the latest version of the package from Github repo [easyntropy/easyntropy-contracts](https://github.com/easyntropy/easyntropy-contracts).

Or when using forge:
```bash:no-line-numbers
forge install easyntropy/easyntropy-contracts
```

Integration contract can be found at `/src/contracts/Easyntropy/EasyntropyConsumer.sol`.

1.1. Suggested `remappings.txt` could look like this:

```bash:no-line-numbers
easyntropy/=lib/easyntropy-contracts/src/contracts/Easyntropy/
```


2. Add integration to your Solidity contract:

```solidity
import { EasyntropyConsumer } from "easyntropy/EasyntropyConsumer.sol";

contract DemoContract is EasyntropyConsumer {
  constructor(address _entropy) EasyntropyConsumer(_entropy) {}
}
```

The `_entropy` parameter should point to the Easyntropy oracle contract. The addresses are:

| Network           | Address                                      |
|-------------------|----------------------------------------------|
| Ethereum mainnet  | [`0x2a9adbbad92f37670e8E98fe86a8B2fb07681690`](https://etherscan.io/address/0x2a9adbbad92f37670e8E98fe86a8B2fb07681690) |
| Ethereum testnet  | [`0x62AdC8dd46E71E6dc04A8EC5304e9E9521A9D436`](https://sepolia.etherscan.io/address/0x62AdC8dd46E71E6dc04A8EC5304e9E9521A9D436) |

### Gas limit
The entropy callback function is subject to a gas limit of `200000`.

### Usage

Once your contract implements the `EasyntropyConsumer` interface, you can start using the oracle.

To make a RNG request, call the `easyntropyRequestWithCallback()` function  (provided by `EasyntropyConsumer`) on *your* contract. The fee will be automatically sent along with the transaction.

You can use the `easyntropyFee()` function (provided by `EasyntropyConsumer`) to retrieve the current fee.

The `easyntropyRequestWithCallback()` function returns a `uint64 requestId`, which can be used to track and reference the request when the response arrives.

#### Default RNG callback
By default, the oracle will invoke the `easyntropyFulfill()` function as the callback, so make sure such that function exists.

```solidity
function exampleRNGRequest() public payable {
  if (msg.value < easyntropyFee()) revert NotEnoughEth();
  uint64 requestId = easyntropyRequestWithCallback();

  // See the examples page for how to use `requestId`
}

function easyntropyFulfill(uint64 requestId, bytes32 seed) external onlyEasyntropy {
  // `requestId` and `seed` are provided in the callback
}
```

#### Custom RNG callback
You can customize the callback function invoked by the oracle by passing a selector to the `easyntropyRequestWithCallback()` function.

This is especially useful if your contract uses RNG in multiple scenarios. It allows you to group requests and responses pairs together in a more readable way.

```solidity
  function setPlayerStats() public payable {
    if (msg.value < easyntropyFee()) revert NotEnoughEth();
    easyntropyRequestWithCallback(this.assignPlayerStats.selector);
  }

  function assignPlayerStats(uint64 requestId, bytes32 seed) external onlyEasyntropy {
    // stats implementation...
  }

  function startBattle() public payable {
    if (msg.value < easyntropyFee()) revert NotEnoughEth();
    easyntropyRequestWithCallback(this.battle.selector);
  }

  function battle(uint64 requestId, bytes32 seed) external onlyEasyntropy {
    // battle implementation...
  }
```

#### RNG request in prepay scenario (without sending the fee with each request)
Easyntropy allows you to prepay your balance so you don’t have to send the fee with each transaction.

Since the `easyntropyRequestWithCallback()` function automatically sends fees, the proper way to send a request to the oracle is to call underlying `entropy.requestWithCallback()`:

```solidity
function exampleRNGRequestWithoutFees() public payable {
  //
  // Assuming your balance covers the RNG fees, you don't need to send any additional fee:
  uint64 requestId = entropy.requestWithCallback();

  // See the examples page for how to use `requestId`
}

function easyntropyFulfill(uint64 requestId, bytes32 seed) external onlyEasyntropy {
  // `requestId` and `seed` are provided in the callback
}
```

### Fees
Unlike other solutions, Easyntropy uses balances associated with each caller address. If your address has enough balance to pay for a request, the request will be processed.

The current fees can be found [here](/documentation/pricing.html).

The most common way to pay for a request is to send the required amount of ETH along with the request. If you use `easyntropyRequestWithCallback()` The fee will be automatically sent along with the transaction.

```solidity:no-line-numbers
// The fee will be automatically sent along with the transaction.
easyntropyRequestWithCallback();
```

Alternatively, you can prepay your contract’s balance externally.

### Prepaying (prepaying scenario)
You can prepay your contract’s address balance with ETH externally. To do so, send ETH to *your* contract's `easyntropyDeposit()` function. `easyntropyDeposit()` funciton is provided by `EasyntropyConsumer` contract.

```solidity:no-line-numbers
easyntropyDeposit();
```

You can also check your balance at any time. Call the `easyntropyCurrentBalance()` function on *your* contract `easyntropyCurrentBalance()` funciton is provided by `EasyntropyConsumer` contract.

```solidity:no-line-numbers
easyntropyCurrentBalance();
```

### Widthrawing (prepaying scenario)
Withdrawing funds is possible at any time. However, due to the asynchronous nature of the oracle, funds related to ongoing requests are marked as reserved and cannot be withdrawn.

Once a request is fulfilled, the reserved fee is deducted from your balance.

Unlike the `easyntropyDeposit()` function, the `easyntropyWithdraw()` function provided by `EasyntropyConsumer` is not publicly accessible. Due to security concerns, its scope is set to internal. To withdraw funds, you must implement your own function that wraps the internal `easyntropyWithdraw()`, taking into account all relevant restrictions and permissions for who can withdraw funds.

Funds will be withdrawn to the corresponding contract address, so ensure your contract can accept ETH and pass it along to the address you intend to withdraw to.

```solidity{6-9}
import { EasyntropyConsumer } from "easyntropy/EasyntropyConsumer.sol";

contract DemoContract is EasyntropyConsumer {
  constructor(address _entropy) EasyntropyConsumer(_entropy) {}

  function withdrawFromEasyntropy(uint256 amount) public {
    easyntropyWithdraw(amount);
    // Funds are transferred to the contract. Make sure it can accept transfers.
  }

  receive() external payable {}
}
```

Oracle contract is set in a way that reserverd funds are released after about a week of inactivity of given request, allowing users to eventually widraw all the funds.

### Testing

Testing Easyntropy callbacks is straightforward. When using the Foundry's Forge testing framework, simply instantiate the `Easyntropy` contract and manually execute `responseWithCallback`.

All examples in this documentation are tested in this manner—see the `.t.sol` files on [GitHub for exact code samples](https://github.com/easyntropy/easyntropy-contracts/blob/master/src/contracts/Examples/).

*(The `Easyntropy` contract used in tests is identical to the one deployed as the oracle. The oracle executes `responseWithCallback` in the same way as in tests, making testing closely match the production environment.)*


```solidity{13,20-27}
import { Test } from "forge-std/Test.sol";

import { Easyntropy } from "../Easyntropy/Easyntropy.sol";
import { MyContract } from "./MyContract.sol";

contract MyContractTest is Test {
  Easyntropy private easyntropy;
  MyContract private subject; // Contract implementing EasyntropyConsumer
  address public easyntropyExecutor;

  function setUp() public {
    easyntropyExecutor = makeAddr("easyntropyExecutor");
    easyntropy = new Easyntropy(easyntropyExecutor, 1 wei);
    subject = new MyContract(address(easyntropy));
  }

  function test_exampleHowToTestRandomness() public {
    uint64 requestId = subject.myFunctionThatRequestsRng{ value: subject.easyntropyFee() }();

    vm.startPrank(easyntropyExecutor);
    easyntropy.responseWithCallback(
      requestId,
      address(subject), // requester
      bytes4(keccak256("easyntropyFulfill(uint64,bytes32)")), // callbackSelector
      bytes32(uint256(123456789)) // seed
    );
  }
}
```

### About Randomness

::: warning
V2 migration missing info:

Provide information on how to verify seeds based on the `requestId`.
:::

Easyntropy is an oracle that provides random `bytes32` seeds to Solidity contracts. It combines two sources of randomness:
- the [drand.love](https://drand.love/) quicknet chain as its source of randomness.
- internal process-based randomness

Each fulfillment emits an on-chain `FulfillmentSucceeded` event, which includes the `requestId` and `easyntropySeed`. Based on the `requestId`, you can query (API endpoint coming soon) all information about the request, including the drand seed as well as the internal seed. With those two, you can recreate and verify the final seed.


#### Salting the seed in `EasyntropyConsumer`
You can provide your own on-chain custom seed salting. If your project provides additional variables (such as a player ID), you can override the `calculateSeed` method in your contract to generate a custom seed.

By default, the `calculateSeed` computes the final seed in the following way:

```solidity
function calculateSeed(uint64 requestId, bytes32 easyntropySeed) internal view virtual returns (bytes32 result) {
  result = keccak256(abi.encodePacked(requestId, easyntropySeed, blockhash(block.number - 1), tx.gasprice));
}
```

### Seamless Pyth Network Adapter

::: warning
Coming soon.
Examples and details will be available soon after we expand to L2s. Stay tuned!
:::

Even though your contract is already integrated with the [Pyth Network RNG](https://docs.pyth.network/entropy), you can still use Easyntropy! Simply point the entropy address in your contract to our adapter layer, and that's it!

The main RNG flows are supported:

```plain:no-line-numbers
V2:
entropy.requestV2() -> entropyCallback(...)

V1:
entropy.requestWithCallback{ value: entropyRequestFee }(entropyProvider, semiRandomSeed) -> entropyCallback(...)
```


