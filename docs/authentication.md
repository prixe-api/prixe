# Authentication

The Prixe Stock API supports two authentication methods to meet different use cases:

1. **API Key Authentication** - Traditional subscription-based access
2. **X402 Payment Protocol** - Pay-per-use for AI agents

## 🔑 API Key Authentication

### Overview

API key authentication is the traditional method for accessing the Prixe API. It's subscription-based and requires you to include your API key in the `Authorization` header of each request.

### Getting Your API Key

1. **Sign up** at [Prixe Dashboard](https://prixe.io/dashboard)
2. **Choose a plan**: Free, Pro, or Enterprise
3. **Generate your API key** from the dashboard
4. **Keep it secure** - never expose it in client-side code

### Usage

Include your API key in the `Authorization` header:

```http
Authorization: Bearer YOUR_API_KEY
```

### Example Requests

**cURL:**
```bash
curl -X POST https://api.prixe.io/api/last_sold \
  -H "Authorization: Bearer pro_abc123..." \
  -H "Content-Type: application/json" \
  -d '{"ticker": "AAPL"}'
```

**JavaScript:**
```javascript
const headers = {
  'Authorization': 'Bearer pro_abc123...',
  'Content-Type': 'application/json'
};

const response = await fetch('https://api.prixe.io/api/last_sold', {
  method: 'POST',
  headers,
  body: JSON.stringify({ ticker: 'AAPL' })
});
```

**Python:**
```python
headers = {
    'Authorization': 'Bearer pro_abc123...',
    'Content-Type': 'application/json'
}

response = requests.post(
    'https://api.prixe.io/api/last_sold',
    headers=headers,
    json={'ticker': 'AAPL'}
)
```

### API Key Types

| Environment | Prefix | Description |
|-------------|--------|-------------|
| **Test** | `test_` | For development and testing |
| **Live** | `pro_` | For production use |

### Best Practices

- ✅ Store API keys in environment variables
- ✅ Use test keys during development
- ✅ Rotate keys regularly
- ❌ Never commit keys to version control
- ❌ Don't expose keys in client-side code

## 💳 X402 Payment Authentication

### Overview

The x402 payment protocol enables AI agents to autonomously pay for API access using cryptocurrency. No API key management is required - payments are made automatically with each request.

### How It Works

1. **Request**: AI agent makes request to `/x402/*` endpoint
2. **Payment Required**: Server responds with 402 status and payment requirements
3. **Payment**: x402-fetch automatically creates payment transaction
4. **Verification**: Server validates payment and returns data

### Network Details

- **Blockchain**: Base Sepolia
- **Currency**: USDC
- **Facilitator**: https://x402.org/facilitator
- **Wallet Address**: `0xa2477E16dCB42E2AD80f03FE97D7F1a1646cd1c0`

### Setup Requirements

1. **Wallet with USDC** on Base Sepolia network
2. **Private key** for transaction signing
3. **x402-fetch library** for payment handling
4. **viem library** for wallet client creation

### Installation

```bash
npm install x402-fetch viem dotenv
```

### Environment Setup

Create a `.env` file:
```env
PRIVATE_KEY=0x... # Your wallet private key
API_URL=https://api.prixe.io
```

### Implementation

```javascript
import { config } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";

config();

const { PRIVATE_KEY } = process.env;

// Create wallet account
const account = privateKeyToAccount(PRIVATE_KEY);

// Create wallet client
const client = createWalletClient({
  account,
  transport: http(),
  chain: baseSepolia,
});

// Wrap fetch with payment capability
const fetchWithPay = wrapFetchWithPayment(fetch, client);

// Make paid request
const response = await fetchWithPay(
  'https://api.prixe.io/x402/last_sold?ticker=AAPL',
  { method: 'GET' }
);

if (response.ok) {
  const data = await response.json();
  console.log(data);
}
```

### Pricing

| Endpoint | Price per Request |
|----------|------------------|
| `/x402/last_sold` | $0.001 |
| `/x402/search` | $0.001 |
| `/x402/price` | $0.005 |

### Error Handling

```javascript
try {
  const response = await fetchWithPay(endpoint, options);
  
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    console.error('Request failed:', response.status, response.statusText);
  }
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    console.error('Not enough USDC in wallet');
  } else if (error.message.includes('payment verification failed')) {
    console.error('Payment could not be verified');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## 🆚 Comparison

| Feature | API Key | X402 Payments |
|---------|---------|---------------|
| **Setup Complexity** | Low | Medium |
| **Cost Structure** | Subscription | Pay-per-use |
| **AI Agent Support** | Manual key management | Autonomous payments |
| **Rate Limits** | Plan-based | Payment-based |
| **Security** | Key management required | Decentralized verification |
| **Network Dependency** | None | Base Sepolia |

## 🛡️ Security Considerations

### API Key Security

- Store keys in secure environment variables
- Use different keys for different environments
- Implement key rotation policies
- Monitor key usage for anomalies
- Revoke compromised keys immediately

### X402 Payment Security

- Keep private keys secure and encrypted
- Use hardware wallets for production
- Monitor wallet balance and transactions
- Implement spending limits
- Use separate wallets for different applications

## 🔄 Migration Between Methods

### From API Key to X402

1. Set up wallet with USDC on Base Sepolia
2. Install x402-fetch and viem libraries
3. Replace API key requests with x402 payment requests
4. Update endpoint URLs from `/api/*` to `/x402/*`
5. Handle payment-specific errors

### From X402 to API Key

1. Sign up for Prixe account and get API key
2. Replace x402 payment calls with authenticated requests
3. Update endpoint URLs from `/x402/*` to `/api/*`
4. Remove x402-fetch dependency
5. Implement rate limiting logic

## 📞 Support

For authentication issues:

- **API Key Problems**: Contact support@prixe.io
- **X402 Payment Issues**: Check [x402 documentation](https://x402.gitbook.io/)
- **General Questions**: Join our Discord community

Remember to never share your private keys or API keys publicly! 