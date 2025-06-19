# X402 Payment Integration for AI Agents

Enable autonomous AI agents to pay for API access using cryptocurrency payments on the Base Sepolia network. No API key management required.

## 📋 Overview

| Feature | Details |
|---------|---------|
| **Protocol** | X402 Payment Protocol |
| **Network** | Base Sepolia |
| **Currency** | USDC |
| **Facilitator** | https://x402.org/facilitator |
| **Wallet** | `0x9a39D71dc89B9974B260364178d3ff6B714592Ea` |

## 💰 Available Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `/xpay/last_sold` | $0.001 | Current stock price data |
| `/xpay/search` | $0.001 | Search stocks by name/ticker |
| `/xpay/price` | $0.005 | Historical OHLCV data |

## 🔄 Payment Flow

1. **Request**: AI agent makes GET request to `/xpay/*` endpoint
2. **402 Response**: Server responds with payment requirements
3. **Payment**: x402-fetch creates payment transaction
4. **Retry**: Request retried with payment header
5. **Success**: Server validates payment and returns data

## 🛠 Setup Requirements

- Wallet with USDC on Base Sepolia network
- Private key for transaction signing
- x402-fetch library for payment handling
- viem library for wallet client creation

## 📦 Installation

```bash
npm install x402-fetch viem dotenv
```

## ⚙️ Environment Setup

Create `.env` file:
```env
PRIVATE_KEY=0x... # Your wallet private key
API_URL=https://api.prixe.io
```

## 💻 Complete Example

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

// Example usage
async function main() {
  try {
    // Get last sold data ($0.001)
    const lastSoldResponse = await fetchWithPay(
      `${API_URL}/xpay/last_sold?ticker=AAPL`,
      { method: "GET" }
    );
    
    if (lastSoldResponse.ok) {
      const data = await lastSoldResponse.json();
      console.log('AAPL data:', data);
    }

    // Search for stocks ($0.001)
    const searchResponse = await fetchWithPay(
      `${API_URL}/xpay/search?query=Tesla`,
      { method: "GET" }
    );
    
    if (searchResponse.ok) {
      const results = await searchResponse.json();
      console.log('Search results:', results);
    }

    // Get historical data ($0.005)
    const startDate = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const endDate = Math.floor(Date.now() / 1000);
    
    const priceResponse = await fetchWithPay(
      `${API_URL}/xpay/price?ticker=MSFT&start_date=${startDate}&end_date=${endDate}&interval=1d`,
      { method: "GET" }
    );
    
    if (priceResponse.ok) {
      const priceData = await priceResponse.json();
      console.log('MSFT price data:', priceData);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## 🚀 Use Cases

### Autonomous Trading Bot

```javascript
class AutonomousTradingBot {
  constructor(walletClient) {
    this.fetchWithPay = wrapFetchWithPayment(fetch, walletClient);
    this.apiUrl = 'https://api.prixe.io';
  }

  async analyzeStock(ticker) {
    // Get current price
    const currentPrice = await this.getCurrentPrice(ticker);
    
    // Get historical data for analysis
    const historicalData = await this.getHistoricalData(ticker);
    
    // Make trading decision
    return this.makeDecision(currentPrice, historicalData);
  }

  async getCurrentPrice(ticker) {
    const response = await this.fetchWithPay(
      `${this.apiUrl}/xpay/last_sold?ticker=${ticker}`,
      { method: 'GET' }
    );
    
    if (response.ok) {
      const data = await response.json();
      return parseFloat(data.lastSalePrice.replace('$', ''));
    }
    throw new Error('Failed to get current price');
  }

  async getHistoricalData(ticker) {
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (30 * 24 * 60 * 60); // 30 days
    
    const response = await this.fetchWithPay(
      `${this.apiUrl}/xpay/price?ticker=${ticker}&start_date=${startDate}&end_date=${endDate}&interval=1d`,
      { method: 'GET' }
    );
    
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to get historical data');
  }
}
```

### AI Research Assistant

```javascript
class AIResearchAssistant {
  constructor(walletClient) {
    this.fetchWithPay = wrapFetchWithPayment(fetch, walletClient);
    this.apiUrl = 'https://api.prixe.io';
  }

  async researchCompany(companyName) {
    // Search for the company
    const searchResults = await this.searchCompany(companyName);
    
    if (searchResults.length === 0) {
      return { error: 'Company not found' };
    }

    const ticker = searchResults[0].ticker;
    
    // Get comprehensive data
    const [currentData, historicalData] = await Promise.all([
      this.getCurrentData(ticker),
      this.getHistoricalData(ticker, 365) // 1 year
    ]);

    return {
      company: searchResults[0],
      currentPrice: currentData,
      historicalPerformance: historicalData,
      analysis: this.performAnalysis(currentData, historicalData)
    };
  }

  async searchCompany(companyName) {
    const response = await this.fetchWithPay(
      `${this.apiUrl}/xpay/search?query=${encodeURIComponent(companyName)}`,
      { method: 'GET' }
    );
    
    return response.ok ? response.json() : [];
  }

  performAnalysis(current, historical) {
    // Implement AI analysis logic
    return {
      trend: 'bullish',
      volatility: 'medium',
      recommendation: 'hold'
    };
  }
}
```

## ⚠️ Error Handling

```javascript
async function handleX402Request(url, options = {}) {
  try {
    const response = await fetchWithPay(url, options);
    
    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Request failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    if (error.message.includes('insufficient funds')) {
      console.error('Not enough USDC in wallet');
      // Implement fund wallet logic
    } else if (error.message.includes('payment verification failed')) {
      console.error('Payment could not be verified');
      // Retry or escalate
    } else if (error.message.includes('network')) {
      console.error('Network connectivity issues');
      // Implement retry with backoff
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}
```

## 🔒 Security Best Practices

1. **Private Key Security**: Store private keys securely and never expose them
2. **Wallet Separation**: Use dedicated wallets for different applications
3. **Spending Limits**: Implement spending limits to prevent excessive costs
4. **Transaction Monitoring**: Monitor wallet transactions for anomalies
5. **Network Security**: Ensure secure connection to Base Sepolia network

## 📊 Cost Optimization

```javascript
class CostOptimizedAgent {
  constructor(walletClient) {
    this.fetchWithPay = wrapFetchWithPayment(fetch, walletClient);
    this.cache = new Map();
    this.cacheTTL = 60000; // 1 minute
  }

  async getCachedData(key, fetcher) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  async getPrice(ticker) {
    return this.getCachedData(`price_${ticker}`, async () => {
      const response = await this.fetchWithPay(
        `https://api.prixe.io/xpay/last_sold?ticker=${ticker}`,
        { method: 'GET' }
      );
      return response.json();
    });
  }
}
```

## 🔗 Related Documentation

- [Authentication Guide](../authentication.md)
- [X402 Protocol Documentation](https://x402.gitbook.io/)
- [Base Sepolia Network](https://docs.base.org/tools/network-information)
- [USDC on Base](https://www.centre.io/usdc)

## 💡 Tips for AI Agents

1. **Implement caching** to reduce costs
2. **Batch requests** when possible
3. **Monitor wallet balance** and refill automatically
4. **Use appropriate intervals** for data requests
5. **Implement circuit breakers** for cost control
6. **Log all transactions** for audit purposes 