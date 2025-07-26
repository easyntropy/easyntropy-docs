# Examples

### Store Last Seed

Request and store RNG.

[Example on Sepolia](https://sepolia.etherscan.io/address/0x61Ce10e6aD3Dee18a1eB1075A6be4C12Ae59F744#readContract)

```solidity{18}
import { EasyntropyConsumer } from "easyntropy/EasyntropyConsumer.sol";

contract StoreLastSeedDefaultCallback is EasyntropyConsumer {
  //
  // support
  bytes32 public latestSeed;

  //
  // events & errors
  event RandomValueObtained(uint64 indexed requestId, bytes32 seed);
  error NotEnoughEth();

  constructor(address _entropy) EasyntropyConsumer(_entropy) {}

  function requestRandomValue() public payable {
    if (msg.value < easyntropyFee()) revert NotEnoughEth();

    easyntropyRequestWithCallback();
  }

  function easyntropyFulfill(uint64 requestId, bytes32 seed) external onlyEasyntropy {
    latestSeed = seed;

    emit RandomValueObtained(requestId, seed);
  }
}
```

### Custom Response Callback Function

Request and store RNG using custom callback.

[Example on Sepolia](https://sepolia.etherscan.io/address/0xB391b6C35aFbbaa3A2F4979bAd7CC51A080b7D3F#readContract)

```solidity{18}
import { EasyntropyConsumer } from "easyntropy/EasyntropyConsumer.sol";

contract StoreLastSeedCustomCallback is EasyntropyConsumer {
  //
  // support
  bytes32 public latestSeed;

  //
  // events & errors
  event RandomValueObtained(uint64 indexed requestId, bytes32 seed);
  error NotEnoughEth();

  constructor(address _entropy) EasyntropyConsumer(_entropy) {}

  function requestRandomValueCustomCallback() public payable {
    if (msg.value < easyntropyFee()) revert NotEnoughEth();

    easyntropyRequestWithCallback(this.customFulfill.selector);
  }

  function customFulfill(uint64 requestId, bytes32 seed) external onlyEasyntropy {
    latestSeed = seed;

    emit RandomValueObtained(requestId, seed);
  }
}
```

### Pass Player Metadata

In this example we use `requestId` to reference specific data we want to modify when RNG response arrive. To do this we need store requestId in `pendingRequest` map.

Request and store RNG using custom callback.

[Example on Sepolia](https://sepolia.etherscan.io/address/0x1d3D2aAc084165E1D493049567cb9cBbeb0F75f4#readContract)

```solidity{15,30-31,36,40}
import { EasyntropyConsumer } from "easyntropy/EasyntropyConsumer.sol";

contract PassPlayerMetadata is EasyntropyConsumer {
  //
  // support
  struct Gladiator {
    uint8 strength;
  }

  struct RNGRequest {
    uint64 gladiatorId;
  }

  mapping(uint64 gladiatorId => Gladiator gladiator) public gladiators;
  mapping(uint64 requestId => RNGRequest rngRequest) public pendingRequests;
  bytes32 public latestSeed;

  //
  // events & errors
  error NotEnoughEth();

  constructor(address _entropy) EasyntropyConsumer(_entropy) {
    gladiators[0] = Gladiator({ strength: 1 });
    gladiators[1] = Gladiator({ strength: 1 });
  }

  function startTrainingGladiator(uint64 gladiatorId) public payable {
    if (msg.value < easyntropyFee()) revert NotEnoughEth();

    uint64 requestId = easyntropyRequestWithCallback(this.trainGladiator.selector);
    pendingRequests[requestId] = RNGRequest({ gladiatorId: gladiatorId });
  }

  function trainGladiator(uint64 requestId, bytes32 seed) external onlyEasyntropy {
    uint256 randomNumber = uint256(seed);
    uint64 gladiatorId = pendingRequests[requestId].gladiatorId;

    gladiators[gladiatorId].strength = uint8(randomNumber & 0xFF);

    delete pendingRequests[requestId];
  }
}
```

### Prepaying contract balance

We can prepay contract balance not to have to pay fees when requesting RNG.

[Example on Sepolia](https://sepolia.etherscan.io/address/0xC18c52a33526cd30441d4533C36E09B16C4BD6dE#readContract)

```solidity{14}
import { EasyntropyConsumer } from "easyntropy/EasyntropyConsumer.sol";

contract Prepaying is EasyntropyConsumer {
  //
  // support
  bytes32 public latestSeed;

  constructor(address _entropy) EasyntropyConsumer(_entropy) {}

  function requestRandomValueWithoutPaying() public {
    //
    // calling entropy.requestWithCallback directly without any fee.
    // this is only possible if easyntropyDeposit{ value: ... }() has been called earlier.
    entropy.requestWithCallback();
  }

  function easyntropyFulfill(uint64, bytes32 seed) external onlyEasyntropy {
    latestSeed = seed;
  }
}
```

### Widthrawing prepaid funds from oracle

You can always widthraw prepaid funds. To do so implment a function wrapping `easyntropyWithdraw(uint256 amount)`.

Make sure to implement:
- proper permission rules
- `receive` funciton allowing receiving funds

[Example on Sepolia](https://sepolia.etherscan.io/address/0xc4f0f186d34C96Db0BA86099a882cd433A646c4c#readContract)

```solidity{9,12}
import { EasyntropyConsumer } from "easyntropy/EasyntropyConsumer.sol";

contract Widthrawing is EasyntropyConsumer {
  constructor(address _entropy) EasyntropyConsumer(_entropy) {}

  function withdrawFromOracle(uint256 amount) public {
    // add your own permission restrictions here...

    easyntropyWithdraw(amount);
  }

  receive() external payable {}
}
```


### Testing
Testing Easyntropy callbacks is straightforward. When using the Foundry's Forge testing framework, instantiate the `Easyntropy` contract and manually execute `responseWithCallback`.

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
      bytes32(uint256(123456789)), // externalSeed
      1337 // externalSeedId
    );
  }
}
```
