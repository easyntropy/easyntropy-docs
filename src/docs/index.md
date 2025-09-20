---
home: true
title: Home
heroImage: ./images/logo.png

actions:
  - text: Documentation
    link: /documentation/
    type: primary
  - text: About
    link: /about/
    type: secondary

features:
  - title: Simple to Integrate
    details: Extremely simple, yet powerful integration — randomness doesn't have to be complicated.
  - title: Competitive Prices
    details: From the community, for the community — our fees are just to cover oracle operation costs.
  - title: Flexible Money Management
    details: Pay per request or prepay your contract address balance — it’s up to you. And yes, you can always withdraw your funds.


footer: easyntropy.tech © 2024-present
---

<div>
  <h4>Mainnet latest transactions <a target="_blank" href="https://etherscan.io/address/0x8EAfe1cBaE6426aa84AFf6D97ea48029d92a5767">(etherscan)</a>:</h4>
  <div class="requests-container" style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
    <div v-for="request in latestMainnetRequests" :key="request.requestId" class="request-item" style="display: flex; border-bottom: 1px solid #ddd; padding: 1rem 0; gap: 70px; color: white">
      <div class="request-content-right">
        <span style="color: grey">ID:</span> {{ request.requestId }}<br />
        <span style="color: grey; font-size: 10px">{{ request.createdAt }}</span>
      </div>
      <div class="request-content-left">
        <span style="color: grey; display: inline-block; width: 90px">tx:</span><a target="_blank" :href="`https://etherscan.io/tx/${request.tx}`" style="font-style: italic; text-decoration: none">{{ request.tx }}</a><br />
        <span style="color: grey; display: inline-block; width: 90px">requester:</span><a target="_blank" :href="`https://etherscan.io/address/${request.requester}`" style="font-style: italic; text-decoration: none">{{ request.requester }}</a><br /><br />
        <span style="color: grey; display: inline-block; width: 90px">seed id:</span><a target="_blank" :href="`https://api.drand.sh/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971/public/${request.seedId}`" style="font-style: italic; text-decoration: none">{{ request.seedId }}</a><br />
        <span style="color: grey; display: inline-block; width: 90px">seed:</span>{{ request.seed }}<br />
        <span style="color: grey; display: inline-block; width: 90px">finalSeed:</span>{{ request.destinationSeed }}<br />
      </div>
    </div>
  </div>
</div>
<hr />

<div>
  <h4>Testnet latest transactions <a target="_blank" href="https://sepolia.etherscan.io/address/0xFc3f5cDAE509d98d8Ef6e1bdCB335ba55Cf68628">(etherscan)</a>:</h4>
  <div class="requests-container" style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
    <div v-for="request in latestTestnetRequests" :key="request.requestId" class="request-item" style="display: flex; border-bottom: 1px solid #ddd; padding: 1rem 0; gap: 70px; color: white">
      <div class="request-content-right">
        <span style="color: grey">ID:</span> {{ request.requestId }}<br />
        <span style="color: grey; font-size: 10px">{{ request.createdAt }}</span>
      </div>
      <div class="request-content-left">
        <span style="color: grey; display: inline-block; width: 90px">tx:</span><a target="_blank" :href="`https://sepolia.etherscan.io/tx/${request.tx}`" style="font-style: italic; text-decoration: none">{{ request.tx }}</a><br />
        <span style="color: grey; display: inline-block; width: 90px">requester:</span><a target="_blank" :href="`https://sepolia.etherscan.io/address/${request.requester}`" style="font-style: italic; text-decoration: none">{{ request.requester }}</a><br /><br />
        <span style="color: grey; display: inline-block; width: 90px">seed id:</span><a target="_blank" :href="`https://api.drand.sh/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971/public/${request.seedId}`" style="font-style: italic; text-decoration: none">{{ request.seedId }}</a><br />
        <span style="color: grey; display: inline-block; width: 90px">seed:</span>{{ request.seed }}<br />
        <span style="color: grey; display: inline-block; width: 90px">finalSeed:</span>{{ request.destinationSeed }}<br />
      </div>
    </div>
  </div>
</div>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// testnet
const latestTestnetRequests = ref([])
const fetchLatestTestnetRequests = async () => {
  if (import.meta.env.SSR) return
  const response = await fetch('/ethereum-testnet/api/rng-requests/latest')
  const data = await response.json()
  latestTestnetRequests.value = data.map(request => ({
    requestId: request.requestId,
    requester: request.requester,
    callbackSelector: request.callbackSelector,
    seedId: request.seedId,
    destinationSeed: request.destinationSeed,
    seed: request.seed,
    tx: request.tx,
    createdAt: new Date(request.createdAt).toLocaleString()
  }))
}

onMounted(() => {
  fetchLatestTestnetRequests()
  const intervalTestnet = setInterval(fetchLatestTestnetRequests, 10000)
  onUnmounted(() => clearInterval(intervalTestnet))
})

// mainnet
const latestMainnetRequests = ref([])
const fetchLatestMainnetRequests = async () => {
  if (import.meta.env.SSR) return
  const response = await fetch('/ethereum-mainnet/api/rng-requests/latest')
  const data = await response.json()
  latestMainnetRequests.value = data.map(request => ({
    requestId: request.requestId,
    requester: request.requester,
    callbackSelector: request.callbackSelector,
    seedId: request.seedId,
    destinationSeed: request.destinationSeed,
    seed: request.seed,
    tx: request.tx,
    createdAt: new Date(request.createdAt).toLocaleString()
  }))
}

onMounted(() => {
  fetchLatestMainnetRequests()
  const intervalMainnet = setInterval(fetchLatestMainnetRequests, 10000)
  onUnmounted(() => clearInterval(intervalMainnet))
})
</script>
