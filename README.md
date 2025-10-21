# Prixe Stock API 📈

**Real-time and historical stock market data API with support for traditional API key authentication and x402 cryptocurrency payments for AI agents.**

[![API Status](https://img.shields.io/badge/API-Live-green)](https://api.prixe.io)
[![Documentation](https://img.shields.io/badge/docs-available-blue)](./docs/)
[![X402 Supported](https://img.shields.io/badge/x402-supported-purple)](./docs/endpoints/x402-payments.md)

## 🚀 Features

- **Real-time Stock Data**: Get current prices, bid/ask spreads, and trading volumes
- **Historical Price Data**: Access OHLCV data with multiple time intervals (1m to 1mo)
- **Company Search**: Find stocks by ticker, company name, or CUSIP
- **WebSocket Streaming**: Real-time price updates via WebSocket connections
- **AI Agent Support**: Autonomous payments using x402 protocol on Base Sepolia
- **Multiple Languages**: Code examples in JavaScript, Python, and cURL

## 📊 Quick Start

### Traditional API Key Authentication

1. **Get your API key** from [Prixe Dashboard](https://prixe.io)

2. **Make your first request**:

```bash
curl -X POST https://api.prixe.io/api/last_sold \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "AAPL"}'
```

## 🛠 API Endpoints

| Endpoint | Description | Auth Type | Price |
|----------|-------------|-----------|-------|
| [`/api/last_sold`](./docs/endpoints/last-sold.md) | Current stock price data | API Key | Subscription |
| [`/api/price`](./docs/endpoints/historical-price.md) | Historical OHLCV data | API Key | Subscription |
| [`/api/search`](./docs/endpoints/search.md) | Search stocks by name/ticker | API Key | Subscription |
| [`/ws/liveprice`](./docs/endpoints/websocket.md) | Real-time WebSocket stream | API Key | Subscription |
| [`/x402/last_sold`](./docs/endpoints/x402-payments.md) | Current price via x402 | x402 Payment | $0.001 |
| [`/x402/price`](./docs/endpoints/x402-payments.md) | Historical data via x402 | x402 Payment | $0.005 |
| [`/x402/search`](./docs/endpoints/x402-payments.md) | Search via x402 | x402 Payment | $0.001 |

## 📚 Documentation

- [**Getting Started**](./docs/getting-started.md) - Setup and first requests
- [**Authentication**](./docs/authentication.md) - API keys and x402 payments
- [**Error Handling**](./docs/error-handling.md) - Common errors and solutions
- [**Rate Limits**](./docs/rate-limits.md) - Usage limits and best practices

### API Endpoints
- [Last Sold Price](./docs/endpoints/last-sold.md) - Real-time price data
- [Historical Price](./docs/endpoints/historical-price.md) - OHLCV time series data
- [Search](./docs/endpoints/search.md) - Find stocks and companies
- [WebSocket](./docs/endpoints/websocket.md) - Real-time streaming
- [X402 Payments](./docs/endpoints/x402-payments.md) - AI agent integration

## 💻 Code Examples

### JavaScript/TypeScript
- [Basic Usage](./examples/javascript/basic-usage.js)
- [Historical Data](./examples/javascript/historical-data.js)
- [WebSocket Streaming](./examples/javascript/websocket-example.js)
- [X402 Integration](./examples/x402-integration/complete-example.js)

### Python
- [Basic Usage](./examples/python/basic_usage.py)
- [Historical Data](./examples/python/historical_data.py)
- [WebSocket Streaming](./examples/python/websocket_example.py)

### cURL
- [All Endpoints](./examples/curl/all-endpoints.sh)

## 🔑 Base URL

```
https://api.prixe.io
```

## 🌐 WebSocket URL

```
wss://api.prixe.io/ws/liveprice?api_key=YOUR_API_KEY
```

## 💳 X402 Payment Network

- **Network**: Base Sepolia
- **Currency**: USDC
- **Facilitator**: https://x402.org/facilitator
- **Wallet**: `0xa2477E16dCB42E2AD80f03FE97D7F1a1646cd1c0`

## 📊 Example Response

```json
{
  "ticker": "AAPL",
  "lastSalePrice": "$182.50",
  "askPrice": "$182.52",
  "bidPrice": "$182.48",
  "volume": "45,123,456",
  "netChange": "+1.25",
  "percentageChange": "+0.69%",
  "deltaIndicator": "up",
  "lastTradeTimestamp": "Dec 15, 2024 4:00 PM ET",
  "isRealTime": true
}
```

## 🤖 AI Agent Integration

Prixe API supports autonomous AI agents through the x402 payment protocol:

- **No API key management** required
- **Pay-per-use** model with micro-payments
- **Automatic payment handling** via x402-fetch
- **Decentralized payment verification**

Learn more in our [X402 Integration Guide](./docs/endpoints/x402-payments.md).

## 🔒 Privacy & Security

- API logs are retained for 90 days for security purposes
- Rate limiting enforced per-user and per-IP
- HTTPS encryption for all requests
- WebSocket connections require authentication

See our [Privacy Policy](./docs/privacy-policy.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/prixe-api/issues)
- **Email**: support@prixe.io
- **Website**: [prixe.io](https://prixe.io)

---

**Built with ❤️ for developers and AI agents** 
