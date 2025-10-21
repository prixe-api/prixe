# Historical Price

Get historical price data for a specified stock ticker and time range

### Path
`POST /api/price`

### Request Fields
| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `ticker` | string | true | The stock ticker symbol (e.g., AAPL, MSFT, GOOGL) | `MSFT` |
| `start_date` | integer | true | Unix timestamp for the start date | `1735828200` |
| `end_date` | integer | true | Unix timestamp for the end date | `1745328600` |
| `interval` | string | true | Time interval for the data points. Allowed values: `1m`, `5m`, `15m`, `30m`, `1h`, `1d`, `1wk`, `1mo` | `1d` |
| `callback_url` | string | false | Optional URL to which the API response will be forwarded as a webhook | `https://your-server.com/webhooks/price-callback` |

### Response Fields
| Field | Type | Description |
|---|---|---|
| `success` | boolean | Indicates if the request was successful |
| `data` | object | Container for the filtered price data |
| `data.ticker` | string | Stock ticker symbol |
| `data.price` | number | Current/regular market price of the stock |
| `data.timestamp` | array | Array of Unix timestamps for each data point |
| `data.open` | array | Array of opening prices for each time period |
| `data.high` | array | Array of highest prices for each time period |
| `data.low` | array | Array of lowest prices for each time period |
| `data.close` | array | Array of closing prices for each time period |
| `data.volume` | array | Array of trading volumes for each time period |

### Example Request
```json
{
  "ticker": "W",
  "start_date": 1752108881,
  "end_date": 1752186964,
  "interval": "1d"
}
```

### Example Response
```json
{
  "success": true,
  "data": {
    "ticker": "W",
    "price": 58.83,
    "timestamp": [1752134400, 1752138000, 1752145200, 1752148800, 1752152400, 1752154200, 1752157800, 1752161400, 1752165000, 1752168600, 1752172200, 1752175800, 1752177600, 1752181200, 1752184800, 1752185539],
    "open": [56.62, 56.62, 56.75, 56.79, 56.99, 56.959999084472656, 57.45000076293945, 58.5099983215332, 58.849998474121094, 59.18000030517578, 59.34000015258789, 59.27000045776367, 58.83, 58.57, 58.83, 58.85],
    "high": [56.62, 56.62, 56.78, 57.3852, 56.99, 57.630001068115234, 58.959999084472656, 58.90999984741211, 59.31999969482422, 59.47999954223633, 59.5099983215332, 59.400001525878906, 59, 59, 58.83, 58.85],
    "low": [56.62, 56.62, 56.57, 55.77, 56.99, 56.525001525878906, 57.40999984741211, 58.23809814453125, 58.650001525878906, 58.9900016784668, 58.86000061035156, 58.77000045776367, 58.5001, 58.57, 58.79, 58.85],
    "close": [56.62, 56.62, 56.57, 56.99, 56.99, 57.459999084472656, 58.5099983215332, 58.849998474121094, 59.154998779296875, 59.34000015258789, 59.255001068115234, 58.83000183105469, 58.83, 58.95, 58.79, 58.85],
    "volume": [0, 0, 0, 0, 0, 505383, 1556023, 357222, 336612, 437100, 798095, 1142203, 365533, 0, 0, 0]
  }
}
```

### Errors
| Status | Message | Description |
|---|---|---|
| 400 | `Missing required parameter` | A required parameter is missing from the request |
| 401 | `Authentication failed` | Invalid API key or API key not provided |
| 429 | `Rate limit exceeded` | You have exceeded the allowed number of requests |
| 500 | `Internal server error` | An error occurred on the server |

### Code Examples

````mdx
<Tabs>
<TabItem value="cURL">
```bash
curl -X POST https://api.prixe.io/api/price \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "MSFT", "start_date": 1735828200, "end_date": 1745328600, "interval": "1d"}'
```
</TabItem>
<TabItem value="JavaScript">
```javascript
fetch('https://api.prixe.io/api/price', {
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
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```
</TabItem>
<TabItem value="Python">
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
</TabItem>
</Tabs>
```` 