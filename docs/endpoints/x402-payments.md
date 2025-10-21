# X402 Payment Integration for AI Agents

AI agents can use the x402 payment protocol to pay for API access without requiring traditional API keys. This enables autonomous systems to make paid API calls using cryptocurrency payments on the Base Sepolia network.

### Benefits
- No API key management required
- Pay-per-use model with micro-payments
- Autonomous operation for AI agents
- Decentralized payment verification
- Automatic payment handling via x402-fetch

### Overview
| Protocol | Network | Currency | Facilitator URL | Wallet Address | Other Documentation |
|---|---|---|---|---|---|
| x402 Payment Protocol | base | USDC | https://x402.org/facilitator | 0x15457430b10c46a28aF91c9b07a447CCB2576f8c | https://x402.gitbook.io/x402/getting-started/quickstart-for-buyers |

### Payment Flow
1. AI agent makes request to `/x402/` endpoint
2. Server responds with 402 Payment Required and payment requirements
3. x402-fetch automatically creates payment transaction on Base Sepolia
4. Payment header is generated and added to retry request
5. Server validates payment and returns requested data

### Requirements
- Wallet with USDC on Base Sepolia network
- Private key for transaction signing
- x402-fetch library or custom x402 implementation
- viem library for wallet client creation

### Setup Instructions
1. Follow instructions at https://x402.gitbook.io/x402/getting-started/quickstart-for-buyers
2. Set up a wallet client using viem with your private key
3. Wrap the native fetch function with x402 payment handling
4. Make requests to `/x402/` endpoints - payments will be handled automatically

### Available Endpoints
| Path | Description | Price | Request Method |
|---|---|---|---|
| `/x402/last_sold` | Access to stock last sold price data | $0.0002 | GET |
| `/x402/search` | Search for tickers, company names, or CUSIPs | $0.0002 | GET |
| `/x402/price` | Historical price data | $0.0002 | GET |
| `/x402/news` | Get news data | $0.0004 | GET |

### Errors
| Status | Message | Description |
|---|---|---|
| 402 | `Payment Required` | Initial response requiring payment - handled automatically by x402-fetch |
| 400 | `Invalid payment` | Payment verification failed or insufficient payment amount |
| 404 | `Endpoint not found` | The requested /x402/ endpoint does not exist |
| 500 | `Internal server error` | An error occurred processing the request |

### Code Examples
````mdx
<Tabs>
<TabItem value="JavaScript">
```javascript
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
```
</TabItem>
<TabItem value="Python">
```python
from eth_account import Account
from x402.clients.requests import x402_requests

# Initialize account with your private key
private_key = "YOUR_PRIVATE_KEY_HERE"  # Replace with your actual private key
account = Account.from_key(private_key)
print(f"Initialized account: {account.address}")

# Create x402 session
session = x402_requests(account)

# Example: Get last sold data for Tesla
response = session.get('https://api.prixe.io/x402/last_sold?ticker=TSLA')
if response.status_code == 200:
    data = response.json()
    print('Tesla last sold data:', data)
    # Output: {'askPrice': '$339.97', 'bidPrice': '$339.76', ...}
else:
    print(f'Error: {response.status_code} - {response.text}')

# Example: Search for stocks
response = session.get('https://api.prixe.io/x402/search?query=Apple')
if response.status_code == 200:
    search_results = response.json()
    print('Search results:', search_results)
    # Output: [{'stockName': 'Apple Inc.', 'ticker': 'AAPL', 'cusip': '037833100'}]
else:
    print(f'Error: {response.status_code} - {response.text}')

# Example: Get historical price data (last 30 days)
import time
start_date = int(time.time()) - (30 * 24 * 60 * 60)  # 30 days ago
end_date = int(time.time())  # now

response = session.get(f'https://api.prixe.io/x402/price?ticker=AAPL&start_date={start_date}&end_date={end_date}&interval=1d')
if response.status_code == 200:
    price_data = response.json()
    print('AAPL historical price data received')
    # Contains OHLCV data in Yahoo Finance chart format
else:
    print(f'Error: {response.status_code} - {response.text}')

# Example: Get news data for NVIDIA
response = session.get('https://api.prixe.io/x402/news?ticker=NVDA')
if response.status_code == 200:
    news_data = response.json()
    print('NVIDIA news data:', news_data)
    # Output: {'success': True, 'news_data': {'count': 5, 'data': [...]}}
else:
    print(f'Error: {response.status_code} - {response.text}')
```
</TabItem>
</Tabs>
```` 