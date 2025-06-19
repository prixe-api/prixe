# Getting Started with Prixe Stock API

Welcome to the Prixe Stock API! This guide will help you get up and running quickly, whether you're using traditional API key authentication or x402 payments for AI agents.

## 🎯 Overview

The Prixe API provides two authentication methods:
- **API Key Authentication** (`/api/*` endpoints) - Traditional subscription-based access
- **X402 Payments** (`/xpay/*` endpoints) - Pay-per-use for AI agents with cryptocurrency

## 🔑 Method 1: API Key Authentication

### Step 1: Get Your API Key

1. Visit [Prixe Dashboard](https://prixe.io/dashboard)
2. Sign up or log into your account
3. Navigate to the API section
4. Generate your API key
5. Choose your subscription plan (Free, Pro, or Enterprise)

### Step 2: Make Your First Request

Let's get the current price for Apple (AAPL):

**cURL:**
```bash
curl -X POST https://api.prixe.io/api/last_sold \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "AAPL"}'
```

**JavaScript:**
```javascript
const response = await fetch('https://api.prixe.io/api/last_sold', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ticker: 'AAPL'
  })
});

const data = await response.json();
console.log(data);
```

**Python:**
```python
import requests

url = "https://api.prixe.io/api/last_sold"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {"ticker": "AAPL"}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)
```

### Step 3: Expected Response

```json
{
  "ticker": "AAPL",
  "lastSalePrice": "$182.50",
  "askPrice": "$182.52", 
  "bidPrice": "$182.48",
  "askSize": "100",
  "bidSize": "200",
  "volume": "45,123,456",
  "netChange": "+1.25",
  "percentageChange": "+0.69%",
  "deltaIndicator": "up",
  "lastTradeTimestamp": "Dec 15, 2024 4:00 PM ET",
  "isRealTime": true,
  "currency": null
}
```

## 💰 Method 2: X402 Payments (AI Agents)

### Step 1: Setup Your Wallet

You'll need a wallet with USDC on the Base Sepolia network:

1. **Fund your wallet** with USDC on Base Sepolia
2. **Get your private key** for transaction signing
3. **Install required packages**:

```bash
npm install x402-fetch viem dotenv
```

### Step 2: Setup Environment

Create a `.env` file:
```env
PRIVATE_KEY=0x... # Your private key
API_URL=https://api.prixe.io
```

### Step 3: Create Wallet Client

```javascript
import { config } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";

config();

const { PRIVATE_KEY, API_URL } = process.env;

// Create wallet client
const account = privateKeyToAccount(PRIVATE_KEY);
const client = createWalletClient({
  account,
  transport: http(),
  chain: baseSepolia,
});

// Wrap fetch with payment handling
const fetchWithPay = wrapFetchWithPayment(fetch, client);
```

### Step 4: Make Paid Requests

```javascript
// Get last sold data (costs $0.001)
const response = await fetchWithPay(`${API_URL}/xpay/last_sold?ticker=AAPL`, {
  method: "GET",
});

if (response.ok) {
  const data = await response.json();
  console.log('AAPL data:', data);
}
```

## 🌐 WebSocket Connection

For real-time data streaming:

```javascript
const socket = new WebSocket('wss://api.prixe.io/ws/liveprice?api_key=YOUR_API_KEY');

socket.onopen = function(e) {
  console.log('Connected to WebSocket');
  
  // Subscribe to AAPL updates
  socket.send(JSON.stringify({
    'event': 'subscribe',
    'data': {
      'ticker': 'AAPL'
    }
  }));
};

socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  if (data.event === 'price_update') {
    console.log(`${data.data.ticker}: ${data.data.data.currentPrice}`);
  }
};
```

## 🔍 Next Steps

Now that you've made your first request, explore more endpoints:

1. **[Historical Price Data](./endpoints/historical-price.md)** - Get OHLCV time series data
2. **[Search Stocks](./endpoints/search.md)** - Find companies by name or ticker
3. **[WebSocket Streaming](./endpoints/websocket.md)** - Real-time price updates
4. **[Error Handling](./error-handling.md)** - Handle common errors gracefully
5. **[Rate Limits](./rate-limits.md)** - Understand usage limits

## 🆘 Common Issues

### Authentication Errors

**Problem**: Getting 401 Unauthorized
**Solution**: 
- Check that your API key is correct
- Ensure you're including the `Bearer ` prefix
- Verify your subscription is active

### Rate Limiting

**Problem**: Getting 429 Rate Limit Exceeded
**Solution**:
- Check your plan's rate limits
- Implement exponential backoff
- Consider upgrading your plan

### x402 Payment Issues

**Problem**: Payment verification failed
**Solution**:
- Ensure you have sufficient USDC on Base Sepolia
- Check your private key is correct
- Verify network connectivity to Base Sepolia

## 📞 Support

Need help? We're here for you:

- **Documentation**: Browse our [full documentation](./README.md)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/prixe-api/issues)
- **Email**: Contact us at support@prixe.io
- **Discord**: Join our developer community

Happy coding! 🚀 