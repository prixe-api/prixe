# Last Sold Price

Get the last sold price data for a specified stock ticker including bid/ask prices, volume, and other market data

### Path
`POST /api/last_sold`

### Request Fields
| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `ticker` | string | true | The stock ticker symbol (e.g., AAPL, MSFT, GOOGL) | `W` |
| `callback_url` | string | false | Optional URL to which the API response will be forwarded as a webhook | `https://your-server.com/webhooks/price-callback` |

### Response Fields
| Field | Type | Description |
|---|---|---|
| `ticker` | string | Stock ticker symbol |
| `lastSalePrice` | string | Price of the last executed trade with currency symbol |
| `lastTradeTimestamp` | string | Timestamp of the last trade |

### Example Request
```json
{
  "ticker": "TSLA"
}
```

### Example Response
```json
{
  "ticker": "W",
  "lastSalePrice": "$58.79",
  "lastTradeTimestamp": "Jul 10, 2025 6:48 PM ET"
}
```

### Errors
| Status | Message | Description |
|---|---|---|
| 400 | `Missing required parameter: ticker` | The ticker parameter is missing from the request |
| 401 | `Authentication failed` | Invalid API key or API key not provided |
| 429 | `Rate limit exceeded` | You have exceeded the allowed number of requests |
| 500 | `Internal server error` | An error occurred on the server |

### Code Examples

````mdx
<Tabs>
<TabItem value="cURL">
```bash
curl -X POST https://api.prixe.io/api/last_sold \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "TSLA"}'
```
</TabItem>
<TabItem value="JavaScript">
```javascript
fetch('https://api.prixe.io/api/last_sold', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ticker: 'TSLA'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```
</TabItem>
<TabItem value="Python">
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
</TabItem>
</Tabs>
```` 