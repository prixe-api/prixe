# WebSocket Real-time Price Streaming

Stream real-time stock price updates via WebSocket connection. Perfect for building live dashboards, trading applications, and real-time monitoring systems.

## 📋 Connection Details

| Protocol | Endpoint | Authentication |
|----------|----------|----------------|
| `WebSocket` | `wss://api.prixe.io/ws/liveprice` | API Key (query parameter) |

**Connection URL**: `wss://api.prixe.io/ws/liveprice?api_key=YOUR_API_KEY`

## 🔌 Connection Flow

1. **Connect** to WebSocket URL with API key
2. **Receive** connection status event
3. **Subscribe** to specific ticker symbols
4. **Receive** real-time price updates
5. **Unsubscribe** or **Disconnect** when done

## 📡 Events

### Client to Server Events

#### Subscribe to Ticker

Subscribe to receive real-time updates for a specific stock ticker.

```json
{
  "event": "subscribe",
  "data": {
    "ticker": "AAPL"
  }
}
```

#### Unsubscribe

Stop receiving updates for the current ticker.

```json
{
  "event": "unsubscribe",
  "data": null
}
```

### Server to Client Events

#### Connection Status

Sent when connection is established.

```json
{
  "event": "connect_status",
  "data": {
    "connection_id": "abcd1234",
    "status": "connected"
  }
}
```

#### Subscription Status

Sent in response to subscribe/unsubscribe events.

```json
{
  "event": "subscription_status", 
  "data": {
    "status": "subscribed",
    "ticker": "AAPL"
  }
}
```

#### Price Update

Real-time price update sent every second.

```json
{
  "event": "price_update",
  "data": {
    "ticker": "AAPL",
    "timestamp": 1747060800,
    "update_count": 5,
    "data": {
      "currentPrice": 182.43,
      "message": "Successfully fetched current stock price",
      "statusCode": 200
    }
  }
}
```

#### Error

Sent when an error occurs.

```json
{
  "event": "error",
  "data": {
    "message": "Error fetching price data: Connection timeout"
  }
}
```

## 💻 Code Examples

### JavaScript/Browser

```javascript
// Connect to the WebSocket
const socket = new WebSocket('wss://api.prixe.io/ws/liveprice?api_key=YOUR_API_KEY');

// Handle connection open
socket.onopen = function(e) {
  console.log('Connection established');
  
  // Subscribe to a ticker
  socket.send(JSON.stringify({
    'event': 'subscribe',
    'data': {
      'ticker': 'AAPL'
    }
  }));
};

// Handle incoming messages
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  // Handle different event types
  switch(data.event) {
    case 'connect_status':
      console.log('Connected with ID:', data.data.connection_id);
      break;
    case 'subscription_status':
      console.log('Subscription status:', data.data.status);
      break;
    case 'price_update':
      console.log(`Price update for ${data.data.ticker}:`, data.data.data.currentPrice);
      break;
    case 'error':
      console.error('Error:', data.data.message);
      break;
  }
};

// Handle errors
socket.onerror = function(error) {
  console.error('WebSocket Error:', error);
};

// Handle connection close
socket.onclose = function(event) {
  console.log('Connection closed:', event.code, event.reason);
};

// To unsubscribe
function unsubscribe() {
  socket.send(JSON.stringify({
    'event': 'unsubscribe'
  }));
}

// To disconnect
function disconnect() {
  socket.close();
}
```

### Node.js

```javascript
import WebSocket from 'ws';

const socket = new WebSocket('wss://api.prixe.io/ws/liveprice?api_key=YOUR_API_KEY');

socket.on('open', function() {
  console.log('Connected to WebSocket');
  
  // Subscribe to ticker
  socket.send(JSON.stringify({
    event: 'subscribe',
    data: {
      ticker: 'MSFT'
    }
  }));
});

socket.on('message', function(data) {
  const message = JSON.parse(data.toString());
  
  if (message.event === 'price_update') {
    console.log(`${message.data.ticker}: $${message.data.data.currentPrice}`);
  }
});

socket.on('error', function(error) {
  console.error('WebSocket error:', error);
});

socket.on('close', function() {
  console.log('WebSocket connection closed');
});
```

### Python

```python
import websocket
import json
import threading
import time

# Define WebSocket callback functions
def on_message(ws, message):
    data = json.loads(message)
    event_type = data.get('event')
    
    if event_type == 'connect_status':
        print(f"Connected with ID: {data['data']['connection_id']}")
    elif event_type == 'subscription_status':
        print(f"Subscription status: {data['data']['status']}")
    elif event_type == 'price_update':
        print(f"Price update for {data['data']['ticker']}: {data['data']['data']['currentPrice']}")
    elif event_type == 'error':
        print(f"Error: {data['data']['message']}")

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print(f"Connection closed: {close_status_code}, {close_msg}")

def on_open(ws):
    print("Connection established")
    
    # Subscribe to a ticker
    ws.send(json.dumps({
        'event': 'subscribe',
        'data': {
            'ticker': 'AAPL'
        }
    }))

# Connect to WebSocket
ws_url = "wss://api.prixe.io/ws/liveprice?api_key=YOUR_API_KEY"
ws = websocket.WebSocketApp(ws_url,
                          on_open=on_open,
                          on_message=on_message,
                          on_error=on_error,
                          on_close=on_close)

# Start WebSocket connection in a separate thread
wst = threading.Thread(target=ws.run_forever)
wst.daemon = True
wst.start()

# Keep the main thread running
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    # To unsubscribe before disconnecting
    ws.send(json.dumps({
        'event': 'unsubscribe'
    }))
    
    # Close the connection
    ws.close()
```

### React Hook

```javascript
import { useState, useEffect, useRef } from 'react';

function useStockPrice(ticker, apiKey) {
  const [price, setPrice] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!ticker || !apiKey) return;

    // Create WebSocket connection
    const socket = new WebSocket(`wss://api.prixe.io/ws/liveprice?api_key=${apiKey}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus('connected');
      setError(null);
      
      // Subscribe to ticker
      socket.send(JSON.stringify({
        event: 'subscribe',
        data: { ticker }
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.event) {
        case 'subscription_status':
          setStatus(data.data.status);
          break;
        case 'price_update':
          setPrice(data.data.data.currentPrice);
          break;
        case 'error':
          setError(data.data.message);
          break;
      }
    };

    socket.onerror = (error) => {
      setError('WebSocket connection error');
      setStatus('error');
    };

    socket.onclose = () => {
      setStatus('disconnected');
    };

    // Cleanup on unmount or ticker change
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ event: 'unsubscribe' }));
        socket.close();
      }
    };
  }, [ticker, apiKey]);

  return { price, status, error };
}

// Usage in component
function StockPriceDisplay({ ticker }) {
  const { price, status, error } = useStockPrice(ticker, 'YOUR_API_KEY');

  if (error) return <div>Error: {error}</div>;
  if (status !== 'subscribed') return <div>Connecting...</div>;

  return (
    <div>
      <h3>{ticker}</h3>
      <p>${price}</p>
    </div>
  );
}
```

## 🚀 Use Cases

### Live Trading Dashboard

```javascript
class TradingDashboard {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.sockets = new Map();
    this.priceCallbacks = new Map();
  }

  subscribeTo(ticker, callback) {
    if (this.sockets.has(ticker)) {
      // Already subscribed, just add callback
      this.priceCallbacks.set(ticker, callback);
      return;
    }

    const socket = new WebSocket(`wss://api.prixe.io/ws/liveprice?api_key=${this.apiKey}`);
    
    socket.onopen = () => {
      socket.send(JSON.stringify({
        event: 'subscribe',
        data: { ticker }
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'price_update') {
        const callback = this.priceCallbacks.get(ticker);
        if (callback) {
          callback(data.data.data.currentPrice);
        }
      }
    };

    this.sockets.set(ticker, socket);
    this.priceCallbacks.set(ticker, callback);
  }

  unsubscribeFrom(ticker) {
    const socket = this.sockets.get(ticker);
    if (socket) {
      socket.send(JSON.stringify({ event: 'unsubscribe' }));
      socket.close();
      this.sockets.delete(ticker);
      this.priceCallbacks.delete(ticker);
    }
  }

  disconnect() {
    this.sockets.forEach(socket => {
      socket.send(JSON.stringify({ event: 'unsubscribe' }));
      socket.close();
    });
    this.sockets.clear();
    this.priceCallbacks.clear();
  }
}

// Usage
const dashboard = new TradingDashboard('YOUR_API_KEY');

dashboard.subscribeTo('AAPL', (price) => {
  document.getElementById('aapl-price').textContent = `$${price}`;
});

dashboard.subscribeTo('MSFT', (price) => {
  document.getElementById('msft-price').textContent = `$${price}`;
});
```

### Price Alert System

```javascript
class PriceAlertSystem {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.alerts = new Map();
    this.socket = null;
    this.currentTicker = null;
  }

  addAlert(ticker, targetPrice, direction, callback) {
    const alertId = Date.now().toString();
    this.alerts.set(alertId, {
      ticker,
      targetPrice,
      direction, // 'above' or 'below'
      callback
    });

    // Subscribe to ticker if not already subscribed
    if (this.currentTicker !== ticker) {
      this.subscribeTo(ticker);
    }

    return alertId;
  }

  subscribeTo(ticker) {
    if (this.socket) {
      this.socket.close();
    }

    this.currentTicker = ticker;
    this.socket = new WebSocket(`wss://api.prixe.io/ws/liveprice?api_key=${this.apiKey}`);

    this.socket.onopen = () => {
      this.socket.send(JSON.stringify({
        event: 'subscribe',
        data: { ticker }
      }));
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'price_update') {
        this.checkAlerts(data.data.data.currentPrice);
      }
    };
  }

  checkAlerts(currentPrice) {
    this.alerts.forEach((alert, alertId) => {
      const { targetPrice, direction, callback } = alert;
      
      let triggered = false;
      if (direction === 'above' && currentPrice >= targetPrice) {
        triggered = true;
      } else if (direction === 'below' && currentPrice <= targetPrice) {
        triggered = true;
      }

      if (triggered) {
        callback(currentPrice, alert);
        this.alerts.delete(alertId);
      }
    });
  }
}

// Usage
const alertSystem = new PriceAlertSystem('YOUR_API_KEY');

alertSystem.addAlert('AAPL', 200, 'above', (price, alert) => {
  console.log(`ALERT: AAPL reached $${price} (target: $${alert.targetPrice})`);
  // Send notification, email, etc.
});
```

## ⚠️ Error Handling

### Connection Errors

```javascript
socket.onerror = function(error) {
  console.error('WebSocket Error:', error);
  // Implement reconnection logic
  setTimeout(() => {
    reconnect();
  }, 5000);
};

socket.onclose = function(event) {
  if (event.code !== 1000) { // Not a normal closure
    console.log('Connection lost, attempting to reconnect...');
    setTimeout(() => {
      reconnect();
    }, 3000);
  }
};

function reconnect() {
  // Recreate WebSocket connection
  createWebSocket();
}
```

### Message Validation

```javascript
socket.onmessage = function(event) {
  try {
    const data = JSON.parse(event.data);
    
    if (!data.event || !data.data) {
      console.error('Invalid message format:', event.data);
      return;
    }
    
    handleMessage(data);
  } catch (error) {
    console.error('Failed to parse message:', event.data, error);
  }
};
```

## 🔒 Security Considerations

1. **API Key Protection**: Never expose API keys in client-side code for production
2. **Rate Limiting**: Respect connection limits and avoid excessive reconnections
3. **Input Validation**: Validate ticker symbols before subscribing
4. **Error Handling**: Implement proper error handling and reconnection logic
5. **Resource Cleanup**: Always close WebSocket connections when done

## 📊 Connection States

| State | Description | Actions Available |
|-------|-------------|------------------|
| `connecting` | Establishing connection | Wait |
| `connected` | Connection established | Subscribe to tickers |
| `subscribed` | Receiving price updates | Unsubscribe, receive data |
| `error` | Connection error occurred | Reconnect |
| `disconnected` | Connection closed | Reconnect if needed |

## 🔗 Related Endpoints

- [Last Sold Price](./last-sold.md) - Get current price data
- [Historical Price](./historical-price.md) - Get historical data
- [Search](./search.md) - Find ticker symbols to stream

## 💡 Tips & Best Practices

1. **Handle reconnections** gracefully with exponential backoff
2. **Validate ticker symbols** before subscribing using the search endpoint
3. **Limit concurrent connections** to avoid rate limiting
4. **Cache last known prices** in case of temporary disconnections
5. **Use heartbeat/ping** mechanisms to detect connection issues
6. **Implement proper cleanup** to avoid memory leaks in SPAs
7. **Consider using a WebSocket library** like Socket.io for production apps 