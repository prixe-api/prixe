# Rate Limits & Usage Guidelines

Understanding and respecting rate limits ensures optimal performance and prevents service interruptions.

## 📊 Rate Limit Overview

### API Key Authentication

| Plan | Requests/Hour | Requests/Day | Requests/Month |
|------|---------------|--------------|----------------|
| **Free** | 100 | 1,000 | 10,000 |
| **Pro** | 1,000 | 10,000 | 100,000 |
| **Enterprise** | 10,000 | 100,000 | 1,000,000 |

### X402 Payments

| Endpoint | Cost | No Rate Limits |
|----------|------|----------------|
| `/xpay/last_sold` | $0.001 | ✅ Pay per use |
| `/xpay/search` | $0.001 | ✅ Pay per use |
| `/xpay/price` | $0.005 | ✅ Pay per use |

## 🛡️ IP-Based Rate Limits

Additional per-IP limits prevent abuse:

- **3,000 requests/hour per IP**
- **30,000 requests/day per IP**  
- **300,000 requests/month per IP**

*Note: IP limits apply regardless of account count*

## 📡 Rate Limit Headers

All API responses include rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1735920000
X-RateLimit-Window: 3600
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Total requests allowed in window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |
| `X-RateLimit-Window` | Window duration in seconds |

## ⚠️ Rate Limit Exceeded (429)

When rate limits are exceeded:

```json
{
  "error": "Rate limit exceeded",
  "status": 429,
  "details": {
    "limit": 1000,
    "remaining": 0,
    "reset": 1735920000
  }
}
```

**Response Headers:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3600
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735920000
```

## 🔄 Best Practices

### 1. Implement Exponential Backoff

```javascript
async function exponentialBackoff(fn, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### 2. Respect Retry-After Header

```javascript
class RateLimitHandler {
  async makeRequest(fn) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        const retryAfter = error.retryAfter || 60; // Default to 60 seconds
        console.log(`Rate limited. Waiting ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return await fn(); // Retry once
      }
      throw error;
    }
  }
}
```

### 3. Monitor Rate Limit Headers

```javascript
function checkRateLimits(response) {
  const remaining = parseInt(response.headers.get('X-RateLimit-Remaining'));
  const limit = parseInt(response.headers.get('X-RateLimit-Limit'));
  const reset = parseInt(response.headers.get('X-RateLimit-Reset'));
  
  const usage = ((limit - remaining) / limit) * 100;
  
  if (usage > 80) {
    console.warn(`Rate limit usage: ${usage.toFixed(1)}%`);
    
    if (usage > 95) {
      const resetTime = new Date(reset * 1000);
      console.warn(`Approaching rate limit. Resets at: ${resetTime}`);
    }
  }
  
  return { remaining, limit, reset, usage };
}
```

### 4. Implement Request Queuing

```javascript
class RequestQueue {
  constructor(requestsPerSecond = 10) {
    this.queue = [];
    this.processing = false;
    this.interval = 1000 / requestsPerSecond;
    this.lastRequest = 0;
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;
      
      if (timeSinceLastRequest < this.interval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.interval - timeSinceLastRequest)
        );
      }
      
      const { requestFn, resolve, reject } = this.queue.shift();
      
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      this.lastRequest = Date.now();
    }
    
    this.processing = false;
  }
}
```

### 5. Cache Responses

```javascript
class ResponseCache {
  constructor(ttlSeconds = 60) {
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Usage
const cache = new ResponseCache(60); // 1 minute TTL

async function getCachedPrice(ticker) {
  const cacheKey = `price_${ticker}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Cache hit:', ticker);
    return cached;
  }
  
  console.log('Cache miss, fetching:', ticker);
  const data = await api.getLastSold(ticker);
  cache.set(cacheKey, data);
  
  return data;
}
```

## 📈 Rate Limit Monitoring

### Track Usage Patterns

```javascript
class UsageTracker {
  constructor() {
    this.requests = [];
    this.hourlyStats = new Map();
  }

  recordRequest() {
    const now = Date.now();
    this.requests.push(now);
    
    // Keep only last hour of requests
    const oneHourAgo = now - (60 * 60 * 1000);
    this.requests = this.requests.filter(time => time > oneHourAgo);
    
    // Update hourly stats
    const hour = new Date(now).getHours();
    const hourlyCount = this.hourlyStats.get(hour) || 0;
    this.hourlyStats.set(hour, hourlyCount + 1);
  }

  getStats() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const requestsLastHour = this.requests.filter(time => time > oneHourAgo).length;
    
    return {
      requestsLastHour,
      totalRequests: this.requests.length,
      hourlyBreakdown: Object.fromEntries(this.hourlyStats),
      averagePerMinute: requestsLastHour / 60
    };
  }
}
```

### Set Up Alerts

```javascript
class RateLimitAlert {
  constructor(threshold = 0.8) {
    this.threshold = threshold;
    this.alertSent = false;
  }

  checkAndAlert(remaining, limit) {
    const usage = (limit - remaining) / limit;
    
    if (usage > this.threshold && !this.alertSent) {
      this.sendAlert(usage, remaining, limit);
      this.alertSent = true;
    }
    
    if (usage < 0.5) {
      this.alertSent = false; // Reset alert
    }
  }

  sendAlert(usage, remaining, limit) {
    console.warn(`🚨 RATE LIMIT ALERT: ${(usage * 100).toFixed(1)}% used`);
    console.warn(`Remaining: ${remaining}/${limit} requests`);
    
    // Send to monitoring service
    this.notifyMonitoringService({
      type: 'rate_limit_warning',
      usage: usage * 100,
      remaining,
      limit,
      timestamp: Date.now()
    });
  }

  notifyMonitoringService(data) {
    // Implement your monitoring service integration
    // e.g., Slack, email, PagerDuty, etc.
  }
}
```

## 🔧 Rate Limit Optimization

### Batch Requests When Possible

```javascript
// ❌ Inefficient: Multiple separate requests
async function getMultipleStocks(tickers) {
  const results = [];
  for (const ticker of tickers) {
    const data = await api.getLastSold(ticker);
    results.push(data);
  }
  return results;
}

// ✅ Efficient: Batched with rate limiting
async function getMultipleStocksOptimized(tickers) {
  const batchSize = 10;
  const delay = 100; // ms between requests
  const results = [];
  
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const batchPromises = batch.map(ticker => api.getLastSold(ticker));
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Delay between batches
    if (i + batchSize < tickers.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}
```

### Use WebSocket for Real-time Data

```javascript
// ❌ Inefficient: Polling
setInterval(async () => {
  const price = await api.getLastSold('AAPL');
  updateUI(price);
}, 1000); // 3600 requests/hour

// ✅ Efficient: WebSocket
const socket = new WebSocket('wss://api.prixe.io/ws/liveprice?api_key=YOUR_API_KEY');
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.event === 'price_update') {
    updateUI(data.data);
  }
}; // Unlimited updates
```

## 📋 Plan Comparison

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| **Hourly Limit** | 100 | 1,000 | 10,000 |
| **Daily Limit** | 1,000 | 10,000 | 100,000 |
| **Monthly Limit** | 10,000 | 100,000 | 1,000,000 |
| **WebSocket** | ❌ | ✅ | ✅ |
| **Historical Data** | 30 days | 2 years | Unlimited |
| **Support** | Community | Email | Priority |
| **SLA** | None | 99.9% | 99.99% |

## 💡 Pro Tips

1. **Monitor usage proactively** - Don't wait for 429 errors
2. **Use WebSocket** for real-time data instead of polling
3. **Cache aggressively** - Most stock data doesn't change every second
4. **Implement circuit breakers** - Prevent cascading failures
5. **Consider X402 payments** - No rate limits for AI agents
6. **Batch requests** when possible to maximize efficiency
7. **Use appropriate intervals** - Don't request minute-by-minute data if hourly suffices

## 🆘 Need Higher Limits?

Contact us for custom rate limits:

- **Email**: sales@prixe.io
- **Enterprise Plans**: Custom limits available
- **Dedicated Infrastructure**: For high-volume applications
- **White-label Solutions**: For resellers and platforms

Remember: X402 payments offer unlimited usage with pay-per-request pricing - perfect for AI agents and high-frequency applications! 