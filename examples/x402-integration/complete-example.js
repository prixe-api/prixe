/**
 * Prixe Stock API - Complete X402 Integration Example
 * 
 * This file demonstrates how AI agents can autonomously pay for API access
 * using the x402 payment protocol on Base Sepolia network.
 */

import { config } from "dotenv";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";

// Load environment variables
config();

const { PRIVATE_KEY, API_URL = 'https://api.prixe.io' } = process.env;

class AutonomousStockAgent {
  constructor(privateKey) {
    if (!privateKey) {
      throw new Error('Private key is required');
    }

    // Create wallet account
    this.account = privateKeyToAccount(privateKey);
    
    // Create wallet client for Base Sepolia
    this.walletClient = createWalletClient({
      account: this.account,
      transport: http(),
      chain: baseSepolia,
    });

    // Wrap fetch with payment capability
    this.fetchWithPay = wrapFetchWithPayment(fetch, this.walletClient);
    
    this.apiUrl = API_URL;
    this.requestCount = 0;
    this.totalSpent = 0;
    
    console.log(`Agent initialized with wallet: ${this.account.address}`);
  }

  async checkWalletBalance() {
    try {
      const balance = await this.walletClient.getBalance({
        address: this.account.address,
      });
      
      return {
        eth: parseFloat(balance) / 1e18,
        address: this.account.address
      };
    } catch (error) {
      console.error('Failed to check wallet balance:', error);
      return null;
    }
  }

  async makePaymentRequest(endpoint, options = {}) {
    try {
      this.requestCount++;
      console.log(`[Request ${this.requestCount}] Making payment request to ${endpoint}`);
      
      const response = await this.fetchWithPay(`${this.apiUrl}${endpoint}`, {
        method: 'GET',
        ...options
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[Request ${this.requestCount}] Payment successful, received data`);
        return data;
      } else {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`[Request ${this.requestCount}] Payment request failed:`, error.message);
      throw error;
    }
  }

  async getCurrentPrice(ticker) {
    const endpoint = `/xpay/last_sold?ticker=${ticker}`;
    return this.makePaymentRequest(endpoint);
  }

  async searchStocks(query) {
    const endpoint = `/xpay/search?query=${encodeURIComponent(query)}`;
    return this.makePaymentRequest(endpoint);
  }

  async getHistoricalData(ticker, startDate, endDate, interval = '1d') {
    const endpoint = `/xpay/price?ticker=${ticker}&start_date=${startDate}&end_date=${endDate}&interval=${interval}`;
    return this.makePaymentRequest(endpoint);
  }

  async analyzeStock(ticker) {
    console.log(`\n🤖 Analyzing stock: ${ticker}`);
    
    try {
      // Step 1: Get current price ($0.001)
      const currentData = await this.getCurrentPrice(ticker);
      console.log(`Current price: ${currentData.lastSalePrice}`);
      
      // Step 2: Get historical data for analysis ($0.005)
      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - (30 * 24 * 60 * 60); // 30 days ago
      
      const historicalData = await this.getHistoricalData(ticker, startDate, endDate, '1d');
      const result = historicalData.data.body.chart.result[0];
      
      // Step 3: Perform basic analysis
      const analysis = this.performTechnicalAnalysis(currentData, result);
      
      console.log(`Analysis complete for ${ticker}:`);
      console.log(`- Trend: ${analysis.trend}`);
      console.log(`- Volatility: ${analysis.volatility}`);
      console.log(`- Recommendation: ${analysis.recommendation}`);
      
      return analysis;
      
    } catch (error) {
      console.error(`Failed to analyze ${ticker}:`, error.message);
      return null;
    }
  }

  performTechnicalAnalysis(currentData, historicalResult) {
    const closePrices = historicalResult.indicators.quote[0].close.filter(p => p !== null);
    const currentPrice = parseFloat(currentData.lastSalePrice.replace('$', ''));
    
    // Simple Moving Average
    const sma20 = closePrices.slice(-20).reduce((a, b) => a + b, 0) / 20;
    
    // Volatility (standard deviation of last 20 days)
    const mean = sma20;
    const variance = closePrices.slice(-20).reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / 20;
    const volatility = Math.sqrt(variance);
    
    // Trend analysis
    const trend = currentPrice > sma20 ? 'bullish' : 'bearish';
    
    // Simple volatility classification
    const volatilityLevel = volatility / currentPrice > 0.02 ? 'high' : volatility / currentPrice > 0.01 ? 'medium' : 'low';
    
    // Basic recommendation
    let recommendation = 'hold';
    if (trend === 'bullish' && volatilityLevel !== 'high') {
      recommendation = 'buy';
    } else if (trend === 'bearish' && volatilityLevel === 'high') {
      recommendation = 'sell';
    }

    return {
      trend,
      volatility: volatilityLevel,
      recommendation,
      currentPrice,
      sma20,
      technicalScore: trend === 'bullish' ? 1 : -1
    };
  }

  async monitorPortfolio(tickers, intervalMinutes = 5) {
    console.log(`\n📊 Starting portfolio monitoring for: ${tickers.join(', ')}`);
    console.log(`Monitoring interval: ${intervalMinutes} minutes`);
    
    const monitoringResults = [];
    
    while (true) {
      console.log(`\n⏰ ${new Date().toLocaleTimeString()} - Checking portfolio...`);
      
      try {
        const analyses = [];
        
        for (const ticker of tickers) {
          const analysis = await this.analyzeStock(ticker);
          if (analysis) {
            analyses.push({ ticker, ...analysis });
          }
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Log portfolio summary
        console.log('\n📈 Portfolio Summary:');
        analyses.forEach(stock => {
          console.log(`${stock.ticker}: ${stock.currentPrice} (${stock.trend}, ${stock.recommendation})`);
        });
        
        // Check for alerts
        const alerts = analyses.filter(stock => 
          stock.recommendation === 'buy' || stock.recommendation === 'sell'
        );
        
        if (alerts.length > 0) {
          console.log('\n🚨 Trading Alerts:');
          alerts.forEach(alert => {
            console.log(`${alert.ticker}: ${alert.recommendation.toUpperCase()} - ${alert.trend} trend`);
          });
        }
        
        monitoringResults.push({
          timestamp: Date.now(),
          analyses,
          alerts
        });
        
        // Wait for next interval
        await new Promise(resolve => setTimeout(resolve, intervalMinutes * 60 * 1000));
        
      } catch (error) {
        console.error('Monitoring error:', error.message);
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s on error
      }
    }
  }

  async findArbitrageOpportunities(exchangeA, exchangeB) {
    console.log(`\n🔍 Searching for arbitrage opportunities between ${exchangeA} and ${exchangeB}`);
    
    // This is a simplified example - real arbitrage would require multiple data sources
    const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    const opportunities = [];
    
    for (const ticker of popularTickers) {
      try {
        // Get current price (in real scenario, you'd query different exchanges)
        const priceData = await this.getCurrentPrice(ticker);
        const currentPrice = parseFloat(priceData.lastSalePrice.replace('$', ''));
        
        // Simulate price difference (replace with actual exchange data)
        const priceVariance = (Math.random() - 0.5) * 0.02; // ±1% variance
        const exchangeBPrice = currentPrice * (1 + priceVariance);
        
        const priceDiff = Math.abs(currentPrice - exchangeBPrice);
        const priceDiffPercent = (priceDiff / currentPrice) * 100;
        
        if (priceDiffPercent > 0.5) { // 0.5% threshold
          opportunities.push({
            ticker,
            exchangeAPrice: currentPrice,
            exchangeBPrice,
            difference: priceDiff,
            differencePercent: priceDiffPercent,
            recommendation: currentPrice < exchangeBPrice ? `Buy on ${exchangeA}, sell on ${exchangeB}` : `Buy on ${exchangeB}, sell on ${exchangeA}`
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Failed to check arbitrage for ${ticker}:`, error.message);
      }
    }
    
    if (opportunities.length > 0) {
      console.log('💰 Arbitrage opportunities found:');
      opportunities.forEach(opp => {
        console.log(`${opp.ticker}: ${opp.differencePercent.toFixed(2)}% difference - ${opp.recommendation}`);
      });
    } else {
      console.log('No significant arbitrage opportunities found');
    }
    
    return opportunities;
  }

  async runAutonomousTrading(strategy = 'momentum') {
    console.log(`\n🚀 Starting autonomous trading with ${strategy} strategy`);
    
    const watchlist = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    const portfolio = new Map();
    let cash = 10000; // Starting cash
    
    while (true) {
      try {
        console.log(`\n💼 Portfolio Status: $${cash.toFixed(2)} cash, ${portfolio.size} positions`);
        
        for (const ticker of watchlist) {
          const analysis = await this.analyzeStock(ticker);
          
          if (!analysis) continue;
          
          const currentPosition = portfolio.get(ticker) || { shares: 0, avgPrice: 0 };
          
          // Simple momentum strategy
          if (strategy === 'momentum') {
            if (analysis.recommendation === 'buy' && cash > analysis.currentPrice * 100) {
              // Buy 100 shares
              const shares = 100;
              const cost = shares * analysis.currentPrice;
              
              cash -= cost;
              portfolio.set(ticker, {
                shares: currentPosition.shares + shares,
                avgPrice: ((currentPosition.shares * currentPosition.avgPrice) + cost) / (currentPosition.shares + shares)
              });
              
              console.log(`🟢 BUY: ${shares} shares of ${ticker} at $${analysis.currentPrice}`);
              
            } else if (analysis.recommendation === 'sell' && currentPosition.shares > 0) {
              // Sell all shares
              const proceeds = currentPosition.shares * analysis.currentPrice;
              cash += proceeds;
              
              const profit = proceeds - (currentPosition.shares * currentPosition.avgPrice);
              console.log(`🔴 SELL: ${currentPosition.shares} shares of ${ticker} at $${analysis.currentPrice} (P&L: ${profit.toFixed(2)})`);
              
              portfolio.delete(ticker);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Calculate total portfolio value
        let totalValue = cash;
        for (const [ticker, position] of portfolio) {
          const currentData = await this.getCurrentPrice(ticker);
          const currentPrice = parseFloat(currentData.lastSalePrice.replace('$', ''));
          totalValue += position.shares * currentPrice;
        }
        
        console.log(`📊 Total Portfolio Value: $${totalValue.toFixed(2)}`);
        
        // Wait 5 minutes before next cycle
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
        
      } catch (error) {
        console.error('Trading cycle error:', error.message);
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute on error
      }
    }
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      estimatedSpent: this.requestCount * 0.001 + (this.requestCount * 0.001), // Rough estimate
      walletAddress: this.account.address
    };
  }
}

// Example usage functions
async function example1_basicAutonomousAnalysis() {
  console.log('\n=== Example 1: Basic Autonomous Stock Analysis ===');
  
  const agent = new AutonomousStockAgent(PRIVATE_KEY);
  
  // Check wallet balance
  const balance = await agent.checkWalletBalance();
  console.log(`Wallet balance: ${balance?.eth.toFixed(6)} ETH`);
  
  // Analyze a few stocks
  const tickers = ['AAPL', 'MSFT', 'TSLA'];
  
  for (const ticker of tickers) {
    await agent.analyzeStock(ticker);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\nAgent stats:', agent.getStats());
}

async function example2_portfolioMonitoring() {
  console.log('\n=== Example 2: Continuous Portfolio Monitoring ===');
  
  const agent = new AutonomousStockAgent(PRIVATE_KEY);
  const watchlist = ['AAPL', 'MSFT', 'GOOGL'];
  
  // Monitor for 15 minutes (3 cycles of 5 minutes each)
  setTimeout(() => {
    console.log('\n⏹️ Stopping monitoring demo...');
    process.exit(0);
  }, 15 * 60 * 1000);
  
  await agent.monitorPortfolio(watchlist, 5);
}

async function example3_marketResearch() {
  console.log('\n=== Example 3: Autonomous Market Research ===');
  
  const agent = new AutonomousStockAgent(PRIVATE_KEY);
  
  // Search for companies in different sectors
  const sectors = ['technology', 'healthcare', 'finance', 'energy'];
  
  for (const sector of sectors) {
    console.log(`\n🔍 Researching ${sector} sector:`);
    
    try {
      const searchResults = await agent.searchStocks(sector);
      console.log(`Found ${searchResults.length} results`);
      
      // Analyze top 3 results
      const topStocks = searchResults.slice(0, 3);
      
      for (const stock of topStocks) {
        console.log(`\nAnalyzing ${stock.stockName} (${stock.ticker}):`);
        await agent.analyzeStock(stock.ticker);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`Failed to research ${sector}:`, error.message);
    }
  }
}

async function example4_arbitrageBot() {
  console.log('\n=== Example 4: Arbitrage Detection Bot ===');
  
  const agent = new AutonomousStockAgent(PRIVATE_KEY);
  
  // Run arbitrage detection (simplified example)
  await agent.findArbitrageOpportunities('Exchange A', 'Exchange B');
}

async function main() {
  console.log('Prixe Stock API - X402 Autonomous Agent Examples');
  console.log('================================================');
  
  if (!PRIVATE_KEY) {
    console.error('\nPlease set your PRIVATE_KEY environment variable with your wallet private key.');
    console.error('Make sure your wallet has USDC on Base Sepolia network.');
    return;
  }
  
  try {
    // Run examples
    await example1_basicAutonomousAnalysis();
    // await example2_portfolioMonitoring(); // Uncomment for continuous monitoring
    await example3_marketResearch();
    await example4_arbitrageBot();
    
    console.log('\n=== Examples completed! ===');
    
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Export for use as module
export {
  AutonomousStockAgent,
  example1_basicAutonomousAnalysis,
  example2_portfolioMonitoring,
  example3_marketResearch,
  example4_arbitrageBot
};

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
} 