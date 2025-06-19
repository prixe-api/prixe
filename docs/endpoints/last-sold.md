# Last Sold Price Endpoint

Get real-time stock price data including last sale price, bid/ask spreads, trading volume, and market indicators.

## 📋 Endpoint Details

| Method | Endpoint | Authentication |
|--------|----------|----------------|
| `POST` | `/api/last_sold` | API Key |
| `GET` | `/xpay/last_sold` | X402 Payment ($0.001) |

**Base URL**: `https://api.prixe.io`

## 📥 Request Parameters

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ticker` | string | Stock ticker symbol | `"AAPL"`, `"MSFT"`, `"GOOGL"` |

### Optional Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `callback_url` | string | Webhook URL for response forwarding | `"https://your-server.com/webhook"` |

## 📤 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `ticker` | string | Stock ticker symbol |
| `lastSalePrice` | string | Price of the last executed trade with currency symbol |
| `askPrice` | string | Current asking price with currency symbol |
| `bidPrice` | string | Current bid price with currency symbol |
| `askSize` | string | Number of shares available at ask price |
| `bidSize` | string | Number of shares wanted at bid price |
| `volume` | string | Trading volume for the day |
| `netChange` | string | Net change in price from previous close |
| `percentageChange` | string | Percentage change from previous close |
| `deltaIndicator` | string | Direction of price change: `"up"`, `"down"`, or `"unchanged"` |
| `lastTradeTimestamp` | string | Timestamp of the last trade |
| `isRealTime` | boolean | Whether the data is real-time |
| `currency` | string\|null | Currency of the price (null for USD) |

## 💻 Code Examples

### API Key Authentication

**cURL:**
```bash
curl -X POST https://api.prixe.io/api/last_sold \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "TSLA"}'
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
    ticker: 'TSLA'
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
payload = {
    "ticker": "TSLA"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)
```

### X402 Payment

**JavaScript/TypeScript:**
```javascript
import { wrapFetchWithPayment } from "x402-fetch";

// Assuming you have a wallet client set up
const fetchWithPay = wrapFetchWithPayment(fetch, walletClient);

const response = await fetchWithPay(
  'https://api.prixe.io/xpay/last_sold?ticker=TSLA',
  { method: 'GET' }
);

if (response.ok) {
  const data = await response.json();
  console.log('Tesla stock data:', data);
}
```

## 📄 Example Request & Response

### Request with Webhook

```json
{
  "ticker": "TSLA",
  "callback_url": "https://your-server.com/webhooks/price-callback"
}
```

### Successful Response

```json
{
  "ticker": "TSLA",
  "lastSalePrice": "$339.80",
  "askPrice": "$339.97",
  "bidPrice": "$339.76",
  "askSize": "205",
  "bidSize": "30",
  "volume": "84,429,343",
  "netChange": "+0.46",
  "percentageChange": "+0.13%",
  "deltaIndicator": "up",
  "lastTradeTimestamp": "May 23, 2025 6:13 PM ET",
  "isRealTime": true,
  "currency": null
}
```

## ⚠️ Error Responses

### 400 Bad Request - Missing Ticker

```json
{
  "error": "Missing required parameter: ticker",
  "status": 400
}
```

### 401 Unauthorized - Invalid API Key

```json
{
  "error": "Authentication failed",
  "status": 401
}
```

### 429 Rate Limit Exceeded

```json
{
  "error": "Rate limit exceeded",
  "status": 429
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "status": 500
}
```

## 🚀 Use Cases

### Portfolio Tracking

Track multiple stocks in real-time:

```javascript
const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];

const promises = tickers.map(ticker => 
  fetch('https://api.prixe.io/api/last_sold', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ticker })
  }).then(res => res.json())
);

const results = await Promise.all(promises);
results.forEach(stock => {
  console.log(`${stock.ticker}: ${stock.lastSalePrice} (${stock.percentageChange})`);
});
```

### Price Alerts

Set up webhook notifications for price changes:

```javascript
const watchStock = async (ticker, webhookUrl) => {
  const response = await fetch('https://api.prixe.io/api/last_sold', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ticker,
      callback_url: webhookUrl
    })
  });
  
  return response.json();
};

// Watch AAPL and get notified of price changes
await watchStock('AAPL', 'https://myapp.com/price-alerts');
```

### AI Trading Bot

Use x402 payments for autonomous trading decisions:

```javascript
const checkStockPrice = async (ticker) => {
  try {
    const response = await fetchWithPay(
      `https://api.prixe.io/xpay/last_sold?ticker=${ticker}`,
      { method: 'GET' }
    );
    
    if (response.ok) {
      const data = await response.json();
      const price = parseFloat(data.lastSalePrice.replace('$', ''));
      
      // AI decision logic
      if (data.deltaIndicator === 'up' && parseFloat(data.percentageChange) > 5) {
        console.log(`${ticker} is trending up strongly: ${data.percentageChange}`);
        // Execute buy order
      }
    }
  } catch (error) {
    console.error('Failed to get price:', error);
  }
};
```

## 🔄 Response Data Interpretation

### Price Movement Indicators

- **deltaIndicator**: 
  - `"up"`: Stock price increased from previous close
  - `"down"`: Stock price decreased from previous close  
  - `"unchanged"`: Stock price same as previous close

### Volume Analysis

- **High volume** + **positive change** = Strong buying interest
- **High volume** + **negative change** = Strong selling pressure
- **Low volume** = Limited market interest

### Bid/Ask Spread

- **Narrow spread** (< 0.1%): High liquidity, efficient market
- **Wide spread** (> 0.5%): Low liquidity, proceed with caution

## 📊 Data Freshness

- **Real-time data**: Updated every second during market hours
- **After hours**: Last available price from regular trading session
- **Weekends/Holidays**: Last price from previous trading day

## 🔗 Related Endpoints

- [Historical Price Data](./historical-price.md) - Get OHLCV time series
- [Search](./search.md) - Find ticker symbols
- [WebSocket](./websocket.md) - Real-time streaming updates

## 💡 Tips & Best Practices

1. **Cache responses** for 1-2 seconds to avoid unnecessary API calls
2. **Use webhooks** for price alerts instead of polling
3. **Implement retry logic** with exponential backoff for failed requests
4. **Monitor rate limits** to avoid 429 errors
5. **Parse numeric values** by removing currency symbols and commas 