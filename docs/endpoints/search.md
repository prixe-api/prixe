# Search Endpoint

Search for stocks by ticker symbol, company name, or CUSIP identifier. This endpoint is essential for finding the correct ticker symbols before making other API calls.

## 📋 Endpoint Details

| Method | Endpoint | Authentication |
|--------|----------|----------------|
| `POST` | `/api/search` | API Key |
| `GET` | `/x402/search` | X402 Payment ($0.0002) |

**Base URL**: `https://api.prixe.io`

## 📥 Request Parameters

At least one search parameter is required. You can combine multiple parameters for more specific searches.

### Search Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `query` | string | General search term (company name, ticker, etc.) | `"Tesla"`, `"Apple Inc"` |
| `ticker` | string | Specific ticker symbol | `"TSLA"`, `"AAPL"` |
| `cusip` | string | Specific CUSIP identifier | `"88160R101"` |
| `cik` | string | Search by CIK number | `"884394"` |

### Optional Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `callback_url` | string | Webhook URL for response forwarding | `"https://your-server.com/webhook"` |

## 📤 Response Format

The response returns an array of matching securities:

```json
[
  {
    "ticker": "TSLA",
    "stockName": "Tesla, Inc.",
    "cusip": "88160R101",
    "cik": "1318605"
  }
]
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `ticker` | string | Stock ticker symbol |
| `stockName` | string | Full company name |
| `cusip` | string | CUSIP identifier |
| `cik` | string | CIK (Central Index Key) number |

## 💻 Code Examples

### API Key Authentication

**cURL:**
```bash
curl -X POST https://api.prixe.io/api/search \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Tesla"}'
```

**JavaScript:**
```javascript
const response = await fetch('https://api.prixe.io/api/search', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'Tesla'
  })
});

const results = await response.json();
console.log(results);
```

**Python:**
```python
import requests

url = "https://api.prixe.io/api/search"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "query": "Tesla"
}

response = requests.post(url, headers=headers, json=payload)
results = response.json()
print(results)
```

### X402 Payment

**JavaScript/TypeScript:**
```javascript
import { wrapFetchWithPayment } from "x402-fetch";

const fetchWithPay = wrapFetchWithPayment(fetch, walletClient);

const response = await fetchWithPay(
  'https://api.prixe.io/x402/search?query=Apple',
  { method: 'GET' }
);

if (response.ok) {
  const results = await response.json();
  console.log('Search results:', results);
}
```

## 📄 Example Requests & Responses

### Search by Company Name

**Request:**
```json
{
  "query": "Tesla"
}
```

**Response:**
```json
[
  {
    "ticker": "TSLA",
    "stockName": "Tesla, Inc.",
    "cusip": "88160R101",
    "cik": "1318605"
  }
]
```

### Search by Ticker Symbol

**Request:**
```json
{
  "ticker": "AAPL"
}
```

**Response:**
```json
[
  {
    "ticker": "AAPL",
    "stockName": "Apple Inc.",
    "cusip": "037833100",
    "cik": "320193"
  }
]
```

### Search by CUSIP

**Request:**
```json
{
  "cusip": "88160R101"
}
```

**Response:**
```json
[
  {
    "ticker": "TSLA",
    "stockName": "Tesla, Inc.",
    "cusip": "88160R101",
    "cik": "1318605"
  }
]
```

### Multiple Results

**Request:**
```json
{
  "query": "Apple"
}
```

**Response:**
```json
[
  {
    "ticker": "AAPL",
    "stockName": "Apple Inc.",
    "cusip": "037833100",
    "cik": "320193"
  },
  {
    "ticker": "AHT",
    "stockName": "Ashford Hospitality Trust Inc",
    "cusip": "04445T101",
    "cik": "1232582"
  }
]
```

## ⚠️ Error Responses

### 400 Bad Request - Invalid Format

```json
{
  "error": "Invalid request format",
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

### Auto-complete Search

Build a ticker search autocomplete feature:

```javascript
async function searchTickers(query) {
  if (query.length < 2) return [];
  
  const response = await fetch('https://api.prixe.io/api/search', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  
  if (response.ok) {
    const results = await response.json();
    return results.map(stock => ({
      label: `${stock.ticker} - ${stock.stockName}`,
      value: stock.ticker,
      cusip: stock.cusip
    }));
  }
  
  return [];
}

// Usage in a search input
const handleSearch = async (searchTerm) => {
  const suggestions = await searchTickers(searchTerm);
  // Display suggestions in UI
  displaySuggestions(suggestions);
};
```

### Portfolio Validation

Validate ticker symbols before adding to portfolio:

```javascript
async function validateTicker(ticker) {
  try {
    const response = await fetch('https://api.prixe.io/api/search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ticker })
    });
    
    if (response.ok) {
      const results = await response.json();
      return results.length > 0 ? results[0] : null;
    }
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}

// Usage
const stockInfo = await validateTicker('AAPL');
if (stockInfo) {
  console.log(`Valid ticker: ${stockInfo.stockName}`);
  // Add to portfolio
} else {
  console.log('Invalid ticker symbol');
}
```

### Company Research

Find all related securities for a company:

```javascript
async function findCompanySecurities(companyName) {
  const response = await fetchWithPay(
    `https://api.prixe.io/x402/search?query=${encodeURIComponent(companyName)}`,
    { method: 'GET' }
  );
  
  if (response.ok) {
    const results = await response.json();
    
    // Group by company name similarity
    const companies = {};
    results.forEach(stock => {
      const key = stock.stockName.toLowerCase();
      if (!companies[key]) {
        companies[key] = [];
      }
      companies[key].push(stock);
    });
    
    return companies;
  }
}

// Usage
const securities = await findCompanySecurities('Microsoft');
console.log(securities);
// Output: {
//   "microsoft corporation": [
//     { ticker: "MSFT", stockName: "Microsoft Corporation", ... }
//   ]
// }
```

### Bulk Ticker Resolution

Resolve multiple tickers or company names:

```javascript
async function bulkResolve(searchTerms) {
  const promises = searchTerms.map(term => 
    fetch('https://api.prixe.io/api/search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: term })
    }).then(res => res.json())
  );
  
  const results = await Promise.all(promises);
  
  // Combine and deduplicate results
  const resolved = {};
  searchTerms.forEach((term, index) => {
    resolved[term] = results[index];
  });
  
  return resolved;
}

// Usage
const terms = ['Apple', 'Microsoft', 'Tesla'];
const resolved = await bulkResolve(terms);

Object.entries(resolved).forEach(([term, matches]) => {
  console.log(`${term}:`, matches.map(m => m.ticker).join(', '));
});
```

## 🔍 Search Tips

### Effective Search Strategies

1. **Company Names**: Use full or partial company names
   - ✅ "Tesla", "Tesla Inc", "Tesla Motors"
   - ✅ "Apple", "Apple Inc"

2. **Ticker Symbols**: Use exact ticker symbols
   - ✅ "AAPL", "MSFT", "GOOGL"
   - ❌ "APL", "MICROSOFT" (partial tickers don't work)

3. **CUSIP Numbers**: Use exact 9-character CUSIP
   - ✅ "037833100" (Apple's CUSIP)
   - ❌ "037833" (partial CUSIP won't match)

### Search Result Interpretation

- **Multiple results**: Common for generic company names
- **No results**: Check spelling or try alternative search terms
- **Exact matches**: Usually appear first in results
- **Similar companies**: May appear when searching by industry keywords

## 🔄 Data Standardization

When working with search results, consider standardizing the data:

```javascript
function standardizeSearchResult(result) {
  return {
    ticker: result.ticker?.toUpperCase(),
    companyName: result.stockName,
    cusip: result.cusip,
    cik: result.cik,
    // Add additional metadata
    searchScore: calculateRelevanceScore(result),
    lastUpdated: new Date().toISOString()
  };
}

function calculateRelevanceScore(result) {
  // Implement scoring logic based on:
  // - Exact ticker match
  // - Company name similarity
  // - Market cap (if available)
  // - Trading volume
  return Math.random(); // Placeholder
}
```

## 🔗 Related Endpoints

- [Last Sold Price](./last-sold.md) - Get price data for found tickers
- [Historical Price](./historical-price.md) - Get historical data for found tickers
- [WebSocket](./websocket.md) - Stream data for found tickers

## 💡 Tips & Best Practices

1. **Cache search results** to reduce API calls for repeated searches
2. **Implement debouncing** for autocomplete to avoid excessive requests
3. **Handle multiple results** gracefully by showing options to users
4. **Validate tickers** before using them in other API calls
5. **Use fuzzy matching** on the client side to improve user experience
6. **Store frequently searched results** locally for better performance 