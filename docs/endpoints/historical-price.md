# Historical Price Data Endpoint

Get historical OHLCV (Open, High, Low, Close, Volume) price data for any stock ticker with customizable time ranges and intervals.

## 📋 Endpoint Details

| Method | Endpoint | Authentication |
|--------|----------|----------------|
| `POST` | `/api/price` | API Key |
| `GET` | `/x402/price` | X402 Payment ($0.005) |

**Base URL**: `https://api.prixe.io`

## 📥 Request Parameters

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ticker` | string | Stock ticker symbol | `"MSFT"`, `"AAPL"`, `"GOOGL"` |
| `start_date` | integer | Unix timestamp for start date | `1735828200` |
| `end_date` | integer | Unix timestamp for end date | `1745328600` |
| `interval` | string | Time interval for data points | `"1d"`, `"1h"`, `"5m"` |

### Optional Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `callback_url` | string | Webhook URL for response forwarding | `"https://your-server.com/webhook"` |

### Supported Intervals

| Interval | Description | Max Range |
|----------|-------------|-----------|
| `1m` | 1 minute | 7 days |
| `5m` | 5 minutes | 60 days |
| `15m` | 15 minutes | 60 days |
| `30m` | 30 minutes | 60 days |
| `1h` | 1 hour | 730 days |
| `1d` | 1 day | 10 years |
| `1wk` | 1 week | No limit |
| `1mo` | 1 month | No limit |

## 📤 Response Structure

The response contains nested data following Yahoo Finance's chart structure:

```json
{
  "data": {
    "body": {
      "chart": {
        "error": null,
        "result": [
          {
            "meta": { /* Stock metadata */ },
            "timestamp": [ /* Unix timestamps */ ],
            "indicators": {
              "quote": [
                {
                  "open": [ /* Opening prices */ ],
                  "high": [ /* High prices */ ],
                  "low": [ /* Low prices */ ],
                  "close": [ /* Closing prices */ ],
                  "volume": [ /* Trading volumes */ ]
                }
              ],
              "adjclose": [
                {
                  "adjclose": [ /* Adjusted closing prices */ ]
                }
              ]
            },
            "events": { /* Dividends, splits, etc. */ }
          }
        ]
      }
    },
    "statusCode": 200
  },
  "success": true
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data.body.chart.result[0].meta` | object | Stock metadata (symbol, currency, exchange) |
| `data.body.chart.result[0].timestamp` | array | Unix timestamps for each data point |
| `data.body.chart.result[0].indicators.quote[0].open` | array | Opening prices |
| `data.body.chart.result[0].indicators.quote[0].high` | array | Highest prices |
| `data.body.chart.result[0].indicators.quote[0].low` | array | Lowest prices |
| `data.body.chart.result[0].indicators.quote[0].close` | array | Closing prices |
| `data.body.chart.result[0].indicators.quote[0].volume` | array | Trading volumes |
| `data.body.chart.result[0].indicators.adjclose[0].adjclose` | array | Dividend-adjusted closing prices |
| `data.body.chart.result[0].events` | object | Corporate events (dividends, stock splits) |

## 💻 Code Examples

### API Key Authentication

**cURL:**
```bash
curl -X POST https://api.prixe.io/api/price \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "MSFT",
    "start_date": 1735828200,
    "end_date": 1745328600,
    "interval": "1d"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('https://api.prixe.io/api/price', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ticker: 'MSFT',
    start_date: 1735828200,
    end_date: 1745328600,
    interval: '1d'
  })
});

const data = await response.json();
console.log(data);
```

**Python:**
```python
import requests

url = "https://api.prixe.io/api/price"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "ticker": "MSFT",
    "start_date": 1735828200,
    "end_date": 1745328600,
    "interval": "1d"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)
```

### X402 Payment

**JavaScript/TypeScript:**
```javascript
import { wrapFetchWithPayment } from "x402-fetch";

const fetchWithPay = wrapFetchWithPayment(fetch, walletClient);

const startDate = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60); // 30 days ago
const endDate = Math.floor(Date.now() / 1000); // now

const response = await fetchWithPay(
  `https://api.prixe.io/x402/price?ticker=AAPL&start_date=${startDate}&end_date=${endDate}&interval=1d`,
  { method: 'GET' }
);

if (response.ok) {
  const priceData = await response.json();
  console.log('AAPL price data:', priceData);
}
```

## 📄 Example Response

```json
{
    "lastSalePrice": "$214.05",
    "lastTradeTimestamp": "Jul 24, 2025 7:59 PM ET",
    "ticker": "AAPL"
}
```

## 🛠 Data Processing Examples

### Extract OHLCV Data

```javascript
function extractOHLCV(response) {
  const result = response.data.body.chart.result[0];
  const timestamps = result.timestamp;
  const quote = result.indicators.quote[0];
  
  const ohlcvData = timestamps.map((timestamp, index) => ({
    timestamp,
    date: new Date(timestamp * 1000).toISOString(),
    open: quote.open[index],
    high: quote.high[index],
    low: quote.low[index],
    close: quote.close[index],
    volume: quote.volume[index]
  }));
  
  return ohlcvData;
}

// Usage
const response = await fetch(/* ... */);
const data = await response.json();
const ohlcv = extractOHLCV(data);

console.log(ohlcv);
// Output: [
//   {
//     timestamp: 1735828200,
//     date: "2025-01-02T00:00:00.000Z",
//     open: 425.53,
//     high: 426.07,
//     low: 414.85,
//     close: 418.58,
//     volume: 16896500
//   },
//   // ...
// ]
```

### Calculate Technical Indicators

```javascript
function calculateSMA(prices, period) {
  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateRSI(closes, period = 14) {
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Usage with API data
const ohlcv = extractOHLCV(response);
const closePrices = ohlcv.map(candle => candle.close);

const sma20 = calculateSMA(closePrices, 20);
const rsi = calculateRSI(closePrices);

console.log('20-day SMA:', sma20[sma20.length - 1]);
console.log('RSI:', rsi);
```

## ⚠️ Error Responses

### 400 Bad Request - Missing Parameter

```json
{
  "error": "Missing required parameter",
  "status": 400
}
```

### 400 Bad Request - Invalid Date Range

```json
{
  "error": "start_date must be before end_date",
  "status": 400
}
```

### 400 Bad Request - Invalid Interval

```json
{
  "error": "Invalid interval. Supported: 1m, 5m, 15m, 30m, 1h, 1d, 1wk, 1mo",
  "status": 400
}
```

## 🚀 Use Cases

### Backtesting Trading Strategies

```javascript
async function backtestStrategy(ticker, startDate, endDate) {
  const response = await fetch('https://api.prixe.io/api/price', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ticker,
      start_date: startDate,
      end_date: endDate,
      interval: '1d'
    })
  });
  
  const data = await response.json();
  const ohlcv = extractOHLCV(data);
  
  // Implement your trading strategy logic
  let position = 0;
  let portfolio = 10000; // Starting capital
  
  for (let i = 1; i < ohlcv.length; i++) {
    const current = ohlcv[i];
    const previous = ohlcv[i - 1];
    
    // Simple moving average crossover strategy
    if (current.close > previous.close && position === 0) {
      // Buy signal
      position = portfolio / current.close;
      portfolio = 0;
    } else if (current.close < previous.close && position > 0) {
      // Sell signal
      portfolio = position * current.close;
      position = 0;
    }
  }
  
  const finalValue = position > 0 ? position * ohlcv[ohlcv.length - 1].close : portfolio;
  const returns = ((finalValue - 10000) / 10000) * 100;
  
  console.log(`Strategy returns: ${returns.toFixed(2)}%`);
}
```

### Building Charts

```javascript
async function getChartData(ticker, days = 30) {
  const endDate = Math.floor(Date.now() / 1000);
  const startDate = endDate - (days * 24 * 60 * 60);
  
  const response = await fetchWithPay(
    `https://api.prixe.io/x402/price?ticker=${ticker}&start_date=${startDate}&end_date=${endDate}&interval=1d`,
    { method: 'GET' }
  );
  
  if (response.ok) {
    const data = await response.json();
    const ohlcv = extractOHLCV(data);
    
    // Format for Chart.js or similar charting library
    return {
      labels: ohlcv.map(candle => candle.date.split('T')[0]),
      datasets: [{
        label: `${ticker} Price`,
        data: ohlcv.map(candle => candle.close),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  }
}
```

## 🔗 Related Endpoints

- [Last Sold Price](./last-sold.md) - Get current market data
- [Search](./search.md) - Find ticker symbols
- [WebSocket](./websocket.md) - Real-time price streaming

## 💡 Tips & Best Practices

1. **Choose appropriate intervals**: Use smaller intervals for short-term analysis, daily for long-term
2. **Respect rate limits**: Don't request more data than you need
3. **Handle null values**: Some data points may have null values during market closures
4. **Use adjusted close prices**: For accurate backtesting when accounting for dividends and splits
5. **Cache large datasets**: Store historical data locally to reduce API calls
6. **Implement pagination**: For very large date ranges, split requests into smaller chunks 