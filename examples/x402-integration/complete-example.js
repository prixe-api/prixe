import { config } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";

config();

const { PRIVATE_KEY, API_URL } = process.env;

const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
const client = createWalletClient({
  account,
  transport: http(),
  chain: baseSepolia,
});

const fetchWithPay = wrapFetchWithPayment(fetch, client);

// Example: Get last sold data
fetchWithPay(`${API_URL}/x402/last_sold?ticker=TSLA`, {
  method: "GET",
})
  .then(async response => {
    if (response.ok) {
      const data = await response.json();
      console.log('Tesla last sold data:', data);
    }
  })
  .catch(error => console.error('Error:', error));

// Example: Search for stocks
fetchWithPay(`${API_URL}/x402/search?query=Apple`, {
  method: "GET",
})
  .then(async response => {
    if (response.ok) {
      const results = await response.json();
      console.log('Search results:', results);
    }
  })
  .catch(error => console.error('Error:', error));

// Example: Get historical price data
const startDate = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60); // 30 days ago
const endDate = Math.floor(Date.now() / 1000); // now

fetchWithPay(`${API_URL}/x402/price?ticker=AAPL&start_date=${startDate}&end_date=${endDate}&interval=1d`, {
  method: "GET",
})
  .then(async response => {
    if (response.ok) {
      const priceData = await response.json();
      console.log('AAPL price data:', priceData);
    }
  })
  .catch(error => console.error('Error:', error));

// Example: Get news data
fetchWithPay(`${API_URL}/x402/news?ticker=NVDA`, {
  method: "GET",
})
  .then(async response => {
    if (response.ok) {
      const newsData = await response.json();
      console.log('NVIDIA news data:', newsData);
    }
  })
  .catch(error => console.error('Error:', error)); 