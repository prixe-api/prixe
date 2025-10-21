# Search

Search for tickers, company names, or CUSIPs

### Path
`POST /api/search`

### Request Fields
| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `query` | string | false | General search term for stock names, tickers, etc. | `Tesla` |
| `ticker` | string | false | Search by specific ticker symbol | `TSLA` |
| `cusip` | string | false | Search by specific CUSIP number | `88160R101` |
| `cik` | string | false | Search by specific CIK number | `884394` |
| `callback_url` | string | false | Optional URL to which the API response will be forwarded as a webhook | `https://your-server.com/webhooks/search-callback` |

### Response Fields
The response is an array of matching securities.
| Field | Type | Description |
|---|---|---|
| `ticker` | string | The ticker symbol |
| `stockName` | string | The name of the stock/company |
| `cusip` | string | The CUSIP identifier |
| `cik` | string | The CIK identifier |

### Example Request
```json
{
  "query": "Tesla"
}
```

### Example Response
```json
[
  {
    "ticker": "TSLA",
    "stockName": "Tesla, Inc.",
    "cusip": "88160R101"
  }
]
```

### Errors
| Status | Message | Description |
|---|---|---|
| 400 | `Invalid request format` | The request was not properly formatted |
| 401 | `Authentication failed` | Invalid API key or API key not provided |
| 429 | `Rate limit exceeded` | You have exceeded the allowed number of requests |
| 500 | `Internal server error` | An error occurred on the server |

### Code Examples

````mdx
<Tabs>
<TabItem value="cURL">
```bash
curl -X POST https://api.prixe.io/api/search \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Tesla"}'
```
</TabItem>
<TabItem value="JavaScript">
```javascript
fetch('https://api.prixe.io/api/search', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'Tesla'
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

url = "https://api.prixe.io/api/search"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "query": "Tesla"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)
```
</TabItem>
</Tabs>
```` 