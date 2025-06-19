/**
 * Prixe Stock API - Basic Usage Examples
 * 
 * This file demonstrates basic usage of the Prixe Stock API
 * using JavaScript/Node.js with traditional API key authentication.
 */

// Configuration
const API_KEY = process.env.PRIXE_API_KEY || 'YOUR_API_KEY';
const BASE_URL = 'https://api.prixe.io';

// Basic API client
class PrixeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.error} (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request failed:', error.message);
      throw error;
    }
  }

  // Get current stock price
  async getLastSold(ticker) {
    return this.request('/api/last_sold', {
      body: JSON.stringify({ ticker })
    });
  }

  // Get historical price data
  async getHistoricalData(ticker, startDate, endDate, interval = '1d') {
    return this.request('/api/price', {
      body: JSON.stringify({
        ticker,
        start_date: startDate,
        end_date: endDate,
        interval
      })
    });
  }

  // Search for stocks
  async search(query) {
    return this.request('/api/search', {
      body: JSON.stringify({ query })
    });
  }
}

// Example usage functions
async function example1_getCurrentPrice() {
  console.log('\n=== Example 1: Get Current Stock Price ===');
  
  const api = new PrixeAPI(API_KEY);
  
  try {
    const data = await api.getLastSold('AAPL');
    
    console.log(`Company: Apple Inc. (${data.ticker})`);
    console.log(`Current Price: ${data.lastSalePrice}`);
    console.log(`Change: ${data.netChange} (${data.percentageChange})`);
    console.log(`Volume: ${data.volume}`);
    console.log(`Bid/Ask: ${data.bidPrice} / ${data.askPrice}`);
    console.log(`Last Trade: ${data.lastTradeTimestamp}`);
    
  } catch (error) {
    console.error('Failed to get current price:', error.message);
  }
}

async function example2_getMultipleStocks() {
  console.log('\n=== Example 2: Get Multiple Stock Prices ===');
  
  const api = new PrixeAPI(API_KEY);
  const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
  
  try {
    const promises = tickers.map(ticker => api.getLastSold(ticker));
    const results = await Promise.all(promises);
    
    console.log('Stock Prices:');
    results.forEach(stock => {
      console.log(`${stock.ticker}: ${stock.lastSalePrice} (${stock.percentageChange})`);
    });
    
  } catch (error) {
    console.error('Failed to get multiple stocks:', error.message);
  }
}

async function example3_searchStocks() {
  console.log('\n=== Example 3: Search for Stocks ===');
  
  const api = new PrixeAPI(API_KEY);
  
  try {
    // Search by company name
    const results = await api.search('Tesla');
    
    console.log('Search results for "Tesla":');
    results.forEach(stock => {
      console.log(`${stock.ticker} - ${stock.stockName}`);
      console.log(`CUSIP: ${stock.cusip}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Failed to search stocks:', error.message);
  }
}

async function example4_getHistoricalData() {
  console.log('\n=== Example 4: Get Historical Price Data ===');
  
  const api = new PrixeAPI(API_KEY);
  
  try {
    // Get last 30 days of data
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (30 * 24 * 60 * 60); // 30 days ago
    
    const data = await api.getHistoricalData('MSFT', startDate, endDate, '1d');
    const result = data.data.body.chart.result[0];
    
    console.log('Microsoft (MSFT) - Last 30 Days:');
    console.log(`Symbol: ${result.meta.symbol}`);
    console.log(`Currency: ${result.meta.currency}`);
    console.log(`Exchange: ${result.meta.exchangeName}`);
    console.log(`Data Points: ${result.timestamp.length}`);
    
    // Show first few data points
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    
    console.log('\nFirst 5 trading days:');
    for (let i = 0; i < Math.min(5, timestamps.length); i++) {
      const date = new Date(timestamps[i] * 1000).toDateString();
      console.log(`${date}: Open: $${quote.open[i]?.toFixed(2)}, Close: $${quote.close[i]?.toFixed(2)}, Volume: ${quote.volume[i]}`);
    }
    
  } catch (error) {
    console.error('Failed to get historical data:', error.message);
  }
}

async function example5_portfolioTracking() {
  console.log('\n=== Example 5: Portfolio Tracking ===');
  
  const api = new PrixeAPI(API_KEY);
  const portfolio = [
    { ticker: 'AAPL', shares: 10 },
    { ticker: 'MSFT', shares: 5 },
    { ticker: 'GOOGL', shares: 2 },
    { ticker: 'AMZN', shares: 3 }
  ];
  
  try {
    const promises = portfolio.map(stock => api.getLastSold(stock.ticker));
    const prices = await Promise.all(promises);
    
    let totalValue = 0;
    
    console.log('Portfolio Summary:');
    console.log('================');
    
    portfolio.forEach((holding, index) => {
      const priceData = prices[index];
      const currentPrice = parseFloat(priceData.lastSalePrice.replace('$', ''));
      const value = currentPrice * holding.shares;
      totalValue += value;
      
      console.log(`${holding.ticker}: ${holding.shares} shares @ ${priceData.lastSalePrice} = $${value.toFixed(2)}`);
      console.log(`  Change: ${priceData.netChange} (${priceData.percentageChange})`);
    });
    
    console.log('================');
    console.log(`Total Portfolio Value: $${totalValue.toFixed(2)}`);
    
  } catch (error) {
    console.error('Failed to track portfolio:', error.message);
  }
}

async function example6_errorHandling() {
  console.log('\n=== Example 6: Error Handling ===');
  
  const api = new PrixeAPI(API_KEY);
  
  // Example 1: Invalid ticker
  try {
    await api.getLastSold('INVALID_TICKER');
  } catch (error) {
    console.log('Expected error for invalid ticker:', error.message);
  }
  
  // Example 2: Missing parameters
  try {
    await api.request('/api/last_sold', {
      body: JSON.stringify({}) // Missing ticker
    });
  } catch (error) {
    console.log('Expected error for missing parameter:', error.message);
  }
  
  // Example 3: Invalid API key
  const invalidApi = new PrixeAPI('invalid_key');
  try {
    await invalidApi.getLastSold('AAPL');
  } catch (error) {
    console.log('Expected error for invalid API key:', error.message);
  }
}

// Rate limiting helper
async function rateLimitedRequests(api, requests, delayMs = 100) {
  const results = [];
  
  for (const request of requests) {
    try {
      const result = await request();
      results.push(result);
      
      // Add delay to respect rate limits
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error('Request failed:', error.message);
      results.push(null);
    }
  }
  
  return results;
}

async function example7_rateLimiting() {
  console.log('\n=== Example 7: Rate Limiting Best Practices ===');
  
  const api = new PrixeAPI(API_KEY);
  const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META'];
  
  // Create request functions
  const requests = tickers.map(ticker => () => api.getLastSold(ticker));
  
  console.log('Making requests with 100ms delay between calls...');
  const startTime = Date.now();
  
  const results = await rateLimitedRequests(api, requests, 100);
  
  const endTime = Date.now();
  const validResults = results.filter(r => r !== null);
  
  console.log(`Completed ${validResults.length}/${tickers.length} requests in ${endTime - startTime}ms`);
}

// Main execution
async function main() {
  console.log('Prixe Stock API - Basic Usage Examples');
  console.log('=====================================');
  
  if (API_KEY === 'YOUR_API_KEY') {
    console.error('\nPlease set your API key in the PRIXE_API_KEY environment variable or update the API_KEY constant.');
    return;
  }
  
  try {
    await example1_getCurrentPrice();
    await example2_getMultipleStocks();
    await example3_searchStocks();
    await example4_getHistoricalData();
    await example5_portfolioTracking();
    await example6_errorHandling();
    await example7_rateLimiting();
    
    console.log('\n=== All examples completed! ===');
    
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PrixeAPI,
    example1_getCurrentPrice,
    example2_getMultipleStocks,
    example3_searchStocks,
    example4_getHistoricalData,
    example5_portfolioTracking,
    example6_errorHandling,
    example7_rateLimiting
  };
}

// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  main();
} 