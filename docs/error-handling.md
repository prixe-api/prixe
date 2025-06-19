# Error Handling

Comprehensive guide to handling errors in the Prixe Stock API, including common error codes, troubleshooting steps, and implementation best practices.

## 📋 HTTP Status Codes

| Code | Status | Description | Action Required |
|------|--------|-------------|-----------------|
| `200` | Success | Request completed successfully | Continue |
| `400` | Bad Request | Invalid request parameters | Fix request |
| `401` | Unauthorized | Authentication failed | Check API key |
| `402` | Payment Required | X402 payment needed | Handle payment |
| `404` | Not Found | Endpoint doesn't exist | Check URL |
| `429` | Too Many Requests | Rate limit exceeded | Implement backoff |
| `500` | Internal Server Error | Server-side issue | Retry later |

## ⚠️ Common Errors

### Authentication Errors (401)

**Missing API Key:**
```json
{
  "error": "Authentication failed",
  "status": 401,
  "details": "API key is required"
}
```

**Solution:**
```javascript
// ✅ Correct
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
};

// ❌ Incorrect - missing Bearer prefix
const headers = {
  'Authorization': 'YOUR_API_KEY',
  'Content-Type': 'application/json'
};
```

**Invalid API Key:**
```json
{
  "error": "Authentication failed", 
  "status": 401,
  "details": "Invalid API key format"
}
```

### Request Validation Errors (400)

**Missing Required Parameter:**
```json
{
  "error": "Missing required parameter: ticker",
  "status": 400
}
```

**Invalid Parameter Value:**
```json
{
  "error": "Invalid interval. Supported: 1m, 5m, 15m, 30m, 1h, 1d, 1wk, 1mo",
  "status": 400
}
```

**Invalid Date Range:**
```json
{
  "error": "start_date must be before end_date",
  "status": 400
}
```

### Rate Limiting (429)

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

### X402 Payment Errors (402)

```json
{
  "error": "Payment Required",
  "status": 402,
  "payment": {
    "amount": "1000",
    "currency": "USDC",
    "network": "base-sepolia",
    "recipient": "0x9a39D71dc89B9974B260364178d3ff6B714592Ea"
  }
}
```

## 🛠 Error Handling Implementations

### JavaScript/TypeScript

```javascript
class PrixeAPIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.prixe.io';
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Network error', 0, error.message);
    }
  }

  async handleError(response) {
    const errorData = await response.json().catch(() => ({}));
    
    switch (response.status) {
      case 400:
        throw new ValidationError(errorData.error, errorData.details);
      case 401:
        throw new AuthenticationError(errorData.error);
      case 429:
        const retryAfter = response.headers.get('Retry-After') || 60;
        throw new RateLimitError(errorData.error, retryAfter);
      case 500:
        throw new ServerError(errorData.error);
      default:
        throw new APIError(errorData.error || 'Unknown error', response.status);
    }
  }

  async getLastSold(ticker, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.makeRequest('/api/last_sold', {
          method: 'POST',
          body: JSON.stringify({ ticker })
        });
      } catch (error) {
        if (error instanceof RateLimitError && attempt < retries) {
          await this.sleep(error.retryAfter * 1000);
          continue;
        }
        if (error instanceof ServerError && attempt < retries) {
          await this.sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
          continue;
        }
        throw error;
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Custom Error Classes
class APIError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

class ValidationError extends APIError {
  constructor(message, details) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends APIError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class RateLimitError extends APIError {
  constructor(message, retryAfter) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class ServerError extends APIError {
  constructor(message) {
    super(message, 500);
    this.name = 'ServerError';
  }
}
```

### Python

```python
import requests
import time
import json
from typing import Optional, Dict, Any

class PrixeAPIError(Exception):
    def __init__(self, message: str, status_code: int, details: Optional[Dict] = None):
        super().__init__(message)
        self.status_code = status_code
        self.details = details or {}

class ValidationError(PrixeAPIError):
    pass

class AuthenticationError(PrixeAPIError):
    pass

class RateLimitError(PrixeAPIError):
    def __init__(self, message: str, retry_after: int):
        super().__init__(message, 429)
        self.retry_after = retry_after

class ServerError(PrixeAPIError):
    pass

class PrixeAPIClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.prixe.io"
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })

    def make_request(self, endpoint: str, method: str = "GET", **kwargs) -> Dict[Any, Any]:
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(method, url, **kwargs)
            self._handle_response(response)
            return response.json()
        except requests.RequestException as e:
            raise PrixeAPIError(f"Network error: {str(e)}", 0)

    def _handle_response(self, response: requests.Response):
        if response.ok:
            return

        try:
            error_data = response.json()
        except json.JSONDecodeError:
            error_data = {"error": response.text or "Unknown error"}

        error_message = error_data.get("error", "Unknown error")
        
        if response.status_code == 400:
            raise ValidationError(error_message, 400, error_data.get("details"))
        elif response.status_code == 401:
            raise AuthenticationError(error_message, 401)
        elif response.status_code == 429:
            retry_after = int(response.headers.get("Retry-After", 60))
            raise RateLimitError(error_message, retry_after)
        elif response.status_code >= 500:
            raise ServerError(error_message, response.status_code)
        else:
            raise PrixeAPIError(error_message, response.status_code)

    def get_last_sold(self, ticker: str, max_retries: int = 3) -> Dict[Any, Any]:
        for attempt in range(1, max_retries + 1):
            try:
                return self.make_request(
                    "/api/last_sold",
                    method="POST",
                    json={"ticker": ticker}
                )
            except RateLimitError as e:
                if attempt < max_retries:
                    time.sleep(e.retry_after)
                    continue
                raise
            except ServerError as e:
                if attempt < max_retries:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
                raise

# Usage Example
try:
    client = PrixeAPIClient("your_api_key")
    data = client.get_last_sold("AAPL")
    print(data)
except ValidationError as e:
    print(f"Invalid request: {e}")
except AuthenticationError as e:
    print(f"Authentication failed: {e}")
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after} seconds")
except ServerError as e:
    print(f"Server error: {e}")
except PrixeAPIError as e:
    print(f"API error: {e}")
```

## 🔄 Retry Strategies

### Exponential Backoff

```javascript
async function exponentialBackoff(fn, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      if (error instanceof ServerError || error instanceof RateLimitError) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error; // Don't retry for client errors
    }
  }
}

// Usage
const data = await exponentialBackoff(async () => {
  return await client.getLastSold('AAPL');
});
```

### Circuit Breaker

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
```

## 🔍 Debugging Tips

### Request/Response Logging

```javascript
class LoggingClient extends PrixeAPIClient {
  async makeRequest(endpoint, options = {}) {
    const requestId = Date.now().toString();
    
    console.log(`[${requestId}] Request:`, {
      endpoint,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body
    });

    try {
      const result = await super.makeRequest(endpoint, options);
      console.log(`[${requestId}] Response:`, result);
      return result;
    } catch (error) {
      console.error(`[${requestId}] Error:`, {
        name: error.name,
        message: error.message,
        status: error.status,
        details: error.details
      });
      throw error;
    }
  }
}
```

### Health Check

```javascript
async function healthCheck(client) {
  try {
    // Simple request to test connectivity
    await client.makeRequest('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query: 'AAPL' })
    });
    return { status: 'healthy' };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

## 📊 Error Monitoring

### Error Tracking

```javascript
class ErrorTracker {
  constructor() {
    this.errors = new Map();
  }

  track(error) {
    const key = `${error.name}_${error.status}`;
    const count = this.errors.get(key) || 0;
    this.errors.set(key, count + 1);
    
    // Send to monitoring service
    this.sendToMonitoring({
      error: error.name,
      status: error.status,
      message: error.message,
      count: count + 1,
      timestamp: Date.now()
    });
  }

  getStats() {
    return Object.fromEntries(this.errors);
  }

  sendToMonitoring(data) {
    // Implementation depends on your monitoring service
    console.log('Error tracked:', data);
  }
}

const errorTracker = new ErrorTracker();

// Use in your error handling
try {
  const data = await client.getLastSold('AAPL');
} catch (error) {
  errorTracker.track(error);
  throw error;
}
```

## 🔗 Best Practices

1. **Always handle errors gracefully** - Don't let unhandled exceptions crash your application
2. **Implement proper retry logic** - Use exponential backoff for transient errors
3. **Validate inputs** - Check parameters before making API calls
4. **Log errors appropriately** - Include enough context for debugging
5. **Monitor error rates** - Set up alerts for high error rates
6. **Cache when possible** - Reduce API calls to avoid rate limits
7. **Use circuit breakers** - Prevent cascading failures
8. **Handle rate limits** - Respect the `Retry-After` header

## 📞 Getting Help

If you encounter persistent errors:

1. **Check API Status**: Visit [status.prixe.io](https://status.prixe.io)
2. **Review Documentation**: Ensure correct API usage
3. **Check Rate Limits**: Verify you're within your plan limits
4. **Contact Support**: Email support@prixe.io with error details 