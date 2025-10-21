# Fetch News

Fetches news data based on a search text. This endpoint communicates with a separate service to perform the action and retrieve news articles. 

Please note: Non cached responses can take up to 10 seconds as we are fetching the news in real time.

### Path
`POST /api/news`

### Request Fields
| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `ticker` | string | true | The ticker to use for fetching news data. Must be a valid ticker from the [SEC list](https://www.sec.gov/files/company_tickers.json) | `TSLA` |
| `callback_url` | string | false | Optional URL to which the API response will be forwarded as a webhook | `https://your-server.com/webhooks/news-callback` |

### Response Fields
| Field | Type | Description |
|---|---|---|
| `success` | boolean | Indicates if the request was successfully processed. |
| `news_data` | object | The news data retrieved for the search term. |
| `news_data.status` | string | Status of the news fetch operation |
| `news_data.ticker` | string | The search term used |
| `news_data.count` | integer | Number of news articles found |
| `news_data.data` | array | Array of news articles |
| `news_data.data.title` | string | The article title |
| `news_data.data.url` | string | URL to the full article |
| `news_data.data.body` | string | Article content/excerpt |

### Example Request
```json
{
  "ticker": "TSLA"
}
```

### Example Response
```json
{
  "success": true,
  "news_data": {
    "status": "success",
    "ticker": "TSLA",
    "count": 2,
    "data": [
      {
        "title": "Tesla Deliveries Due, But This Is The Big News For TSLA Bulls",
        "url": "https://www.investors.com/news/tesla-deliveries-due-fsd-v14-tsla-bulls/",
        "body": "The big driver for Q3 deliveries is the Sept. 30 expiration of the $7,500 U.S. tax credit, pulling forward demand. Buyers can take delivery later and still get the EV tax credit as long as they make a firm order by Sept. 30 with at least a nominal payment......"
      },
      {
        "title": "Tesla Board Prints Billions In Pay As Musk Buys $1B, And I'm Shorting The Signal",
        "url": "https://seekingalpha.com/article/4826258-tesla-board-prints-billions-in-pay-as-musk-buys-1b-and-im-shorting-the-signal",
        "body": "It seems to me that fewer and fewer people realize that Tesla (NASDAQ:TSLA) is still primarily a car manufacturer. Sales in Q2 2025 fell by 12% YoY, and CEO Elon Musk himself spoke of a few tough quarters ahead. Two months have passed, and something has changed, so suddenly the next few quarters are looking bright? I don't think so. The company is still not in a position to justify its premium valuation multiples."
      }
    ]
  }
}
```

### Errors
| Status | Message | Description |
|---|---|---|
| 400 | `Invalid request format` | The request was not properly formatted or 'ticker' is missing. |
| 401 | `Authentication failed` | Invalid API key or API key not provided or this feature requires a Pro+ subscription. |
| 429 | `Rate limit exceeded` | You have exceeded the allowed number of requests |
| 503 | `Failed to communicate with external service` | The server was unable to communicate with the tab creation service. |
| 500 | `Internal server error` | An error occurred on the server |

### Code Examples

````mdx
<Tabs>
<TabItem value="cURL">
```bash
curl -X POST https://api.prixe.io/api/news \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "TSLA"}'
```
</TabItem>
<TabItem value="JavaScript">
```javascript
fetch('https://api.prixe.io/api/news', {
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

url = "https://api.prixe.io/api/news"
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
