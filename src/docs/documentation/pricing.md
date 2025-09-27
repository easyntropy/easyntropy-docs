# Pricing

*From the community, for the community — our fees are just to cover oracle operation costs.*

Each request comes with a fee, which can be paid [along with the request itself](/documentation/#fees) or [prepaid in advance](/documentation/#prepaying-prepaying-scenario).

##### Pricing per request:

<table>
  <thead>
    <tr>
      <th>Network</th>
      <th width="200">Fee</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Ethereum mainnet</td>
      <td><span id="mainnet-price">{{ mainnetPrice }}</span></td>
    </tr>
    <tr>
      <td>Ethereum testnet</td>
      <td><span id="testnet-price">{{ testnetPrice }}</span></td>
    </tr>
  </tbody>
</table>

<script setup>
import { ref, onMounted } from 'vue';
import { ethers } from 'ethers';

const mainnetPrice = ref("loading...");
const testnetPrice = ref("loading...");

const fetchPrices = async () => {
  if (import.meta.env.SSR) return;

  const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
  const contract = new ethers.Contract(
    '0x2a9adbbad92f37670e8E98fe86a8B2fb07681690',
    ['function fee() view returns (uint256)'],
    provider
  );

  const fee = await contract.fee();
  mainnetPrice.value = `${ethers.formatEther(fee)} ETH`;
  testnetPrice.value = "0.00000001 ETH";
}

onMounted(() => {
  fetchPrices();
})
</script>
