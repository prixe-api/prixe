"""
Prixe Stock API - Basic Usage Examples

This file demonstrates basic usage of the Prixe Stock API
using Python with traditional API key authentication.
"""

import os
import json
import time
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

# Configuration
API_KEY = os.getenv('PRIXE_API_KEY', 'YOUR_API_KEY')
BASE_URL = 'https://api.prixe.io'

class PrixeAPI:
    """Simple API client for Prixe Stock API"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a request to the API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.post(url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            try:
                error_data = response.json()
                raise Exception(f"API Error: {error_data.get('error', 'Unknown error')} ({response.status_code})")
            except json.JSONDecodeError:
                raise Exception(f"HTTP Error: {response.status_code}")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")
    
    def get_last_sold(self, ticker: str) -> Dict[str, Any]:
        """Get current stock price"""
        return self.request('/api/last_sold', {'ticker': ticker})
    
    def get_historical_data(self, ticker: str, start_date: int, end_date: int, interval: str = '1d') -> Dict[str, Any]:
        """Get historical price data"""
        return self.request('/api/price', {
            'ticker': ticker,
            'start_date': start_date,
            'end_date': end_date,
            'interval': interval
        })
    
    def search(self, query: str) -> List[Dict[str, Any]]:
        """Search for stocks"""
        return self.request('/api/search', {'query': query})

def example1_get_current_price():
    """Example 1: Get Current Stock Price"""
    print('\n=== Example 1: Get Current Stock Price ===')
    
    api = PrixeAPI(API_KEY)
    
    try:
        data = api.get_last_sold('AAPL')
        
        print(f"Company: Apple Inc. ({data['ticker']})")
        print(f"Current Price: {data['lastSalePrice']}")
        print(f"Change: {data['netChange']} ({data['percentageChange']})")
        print(f"Volume: {data['volume']}")
        print(f"Bid/Ask: {data['bidPrice']} / {data['askPrice']}")
        print(f"Last Trade: {data['lastTradeTimestamp']}")
        
    except Exception as e:
        print(f'Failed to get current price: {e}')

def example2_get_multiple_stocks():
    """Example 2: Get Multiple Stock Prices"""
    print('\n=== Example 2: Get Multiple Stock Prices ===')
    
    api = PrixeAPI(API_KEY)
    tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
    
    try:
        results = []
        for ticker in tickers:
            data = api.get_last_sold(ticker)
            results.append(data)
            time.sleep(0.1)  # Rate limiting
        
        print('Stock Prices:')
        for stock in results:
            print(f"{stock['ticker']}: {stock['lastSalePrice']} ({stock['percentageChange']})")
            
    except Exception as e:
        print(f'Failed to get multiple stocks: {e}')

def example3_search_stocks():
    """Example 3: Search for Stocks"""
    print('\n=== Example 3: Search for Stocks ===')
    
    api = PrixeAPI(API_KEY)
    
    try:
        # Search by company name
        results = api.search('Tesla')
        
        print('Search results for "Tesla":')
        for stock in results:
            print(f"{stock['ticker']} - {stock['stockName']}")
            print(f"CUSIP: {stock['cusip']}")
            print('---')
            
    except Exception as e:
        print(f'Failed to search stocks: {e}')

def example4_get_historical_data():
    """Example 4: Get Historical Price Data"""
    print('\n=== Example 4: Get Historical Price Data ===')
    
    api = PrixeAPI(API_KEY)
    
    try:
        # Get last 30 days of data
        end_date = int(time.time())
        start_date = end_date - (30 * 24 * 60 * 60)  # 30 days ago
        
        data = api.get_historical_data('MSFT', start_date, end_date, '1d')
        result = data['data']['body']['chart']['result'][0]
        
        print('Microsoft (MSFT) - Last 30 Days:')
        print(f"Symbol: {result['meta']['symbol']}")
        print(f"Currency: {result['meta']['currency']}")
        print(f"Exchange: {result['meta']['exchangeName']}")
        print(f"Data Points: {len(result['timestamp'])}")
        
        # Show first few data points
        timestamps = result['timestamp']
        quote = result['indicators']['quote'][0]
        
        print('\nFirst 5 trading days:')
        for i in range(min(5, len(timestamps))):
            date = datetime.fromtimestamp(timestamps[i]).strftime('%Y-%m-%d')
            open_price = quote['open'][i] if quote['open'][i] else 0
            close_price = quote['close'][i] if quote['close'][i] else 0
            volume = quote['volume'][i] if quote['volume'][i] else 0
            print(f"{date}: Open: ${open_price:.2f}, Close: ${close_price:.2f}, Volume: {volume:,}")
            
    except Exception as e:
        print(f'Failed to get historical data: {e}')

def example5_portfolio_tracking():
    """Example 5: Portfolio Tracking"""
    print('\n=== Example 5: Portfolio Tracking ===')
    
    api = PrixeAPI(API_KEY)
    portfolio = [
        {'ticker': 'AAPL', 'shares': 10},
        {'ticker': 'MSFT', 'shares': 5},
        {'ticker': 'GOOGL', 'shares': 2},
        {'ticker': 'AMZN', 'shares': 3}
    ]
    
    try:
        total_value = 0
        
        print('Portfolio Summary:')
        print('================')
        
        for holding in portfolio:
            price_data = api.get_last_sold(holding['ticker'])
            current_price = float(price_data['lastSalePrice'].replace('$', '').replace(',', ''))
            value = current_price * holding['shares']
            total_value += value
            
            print(f"{holding['ticker']}: {holding['shares']} shares @ {price_data['lastSalePrice']} = ${value:,.2f}")
            print(f"  Change: {price_data['netChange']} ({price_data['percentageChange']})")
            
            time.sleep(0.1)  # Rate limiting
        
        print('================')
        print(f"Total Portfolio Value: ${total_value:,.2f}")
        
    except Exception as e:
        print(f'Failed to track portfolio: {e}')

def example6_error_handling():
    """Example 6: Error Handling"""
    print('\n=== Example 6: Error Handling ===')
    
    api = PrixeAPI(API_KEY)
    
    # Example 1: Invalid ticker
    try:
        api.get_last_sold('INVALID_TICKER')
    except Exception as e:
        print(f'Expected error for invalid ticker: {e}')
    
    # Example 2: Missing parameters
    try:
        api.request('/api/last_sold', {})  # Missing ticker
    except Exception as e:
        print(f'Expected error for missing parameter: {e}')
    
    # Example 3: Invalid API key
    invalid_api = PrixeAPI('invalid_key')
    try:
        invalid_api.get_last_sold('AAPL')
    except Exception as e:
        print(f'Expected error for invalid API key: {e}')

def rate_limited_requests(api: PrixeAPI, requests: List, delay_ms: int = 100):
    """Helper function to make requests with rate limiting"""
    results = []
    
    for request_func in requests:
        try:
            result = request_func()
            results.append(result)
            
            if delay_ms > 0:
                time.sleep(delay_ms / 1000.0)
                
        except Exception as e:
            print(f'Request failed: {e}')
            results.append(None)
    
    return results

def example7_rate_limiting():
    """Example 7: Rate Limiting Best Practices"""
    print('\n=== Example 7: Rate Limiting Best Practices ===')
    
    api = PrixeAPI(API_KEY)
    tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META']
    
    # Create request functions
    requests = [lambda t=ticker: api.get_last_sold(t) for ticker in tickers]
    
    print('Making requests with 100ms delay between calls...')
    start_time = time.time()
    
    results = rate_limited_requests(api, requests, 100)
    
    end_time = time.time()
    valid_results = [r for r in results if r is not None]
    
    print(f"Completed {len(valid_results)}/{len(tickers)} requests in {(end_time - start_time) * 1000:.0f}ms")

def calculate_technical_indicators(prices: List[float]) -> Dict[str, float]:
    """Calculate basic technical indicators"""
    if len(prices) < 20:
        return {}
    
    # Simple Moving Average (20-day)
    sma_20 = sum(prices[-20:]) / 20
    
    # Price change
    price_change = prices[-1] - prices[-2] if len(prices) > 1 else 0
    price_change_pct = (price_change / prices[-2] * 100) if len(prices) > 1 and prices[-2] != 0 else 0
    
    return {
        'sma_20': sma_20,
        'price_change': price_change,
        'price_change_pct': price_change_pct,
        'current_price': prices[-1]
    }

def example8_technical_analysis():
    """Example 8: Basic Technical Analysis"""
    print('\n=== Example 8: Basic Technical Analysis ===')
    
    api = PrixeAPI(API_KEY)
    
    try:
        # Get 30 days of historical data
        end_date = int(time.time())
        start_date = end_date - (30 * 24 * 60 * 60)
        
        data = api.get_historical_data('AAPL', start_date, end_date, '1d')
        result = data['data']['body']['chart']['result'][0]
        
        # Extract closing prices
        close_prices = [price for price in result['indicators']['quote'][0]['close'] if price is not None]
        
        if len(close_prices) >= 20:
            indicators = calculate_technical_indicators(close_prices)
            
            print('Apple (AAPL) Technical Analysis:')
            print(f"Current Price: ${indicators['current_price']:.2f}")
            print(f"20-day SMA: ${indicators['sma_20']:.2f}")
            print(f"Price Change: ${indicators['price_change']:.2f} ({indicators['price_change_pct']:.2f}%)")
            
            # Simple trend analysis
            if indicators['current_price'] > indicators['sma_20']:
                print('Trend: Above 20-day average (Bullish)')
            else:
                print('Trend: Below 20-day average (Bearish)')
        else:
            print('Insufficient data for technical analysis')
            
    except Exception as e:
        print(f'Failed to perform technical analysis: {e}')

def main():
    """Main execution function"""
    print('Prixe Stock API - Basic Usage Examples (Python)')
    print('===============================================')
    
    if API_KEY == 'YOUR_API_KEY':
        print('\nPlease set your API key in the PRIXE_API_KEY environment variable or update the API_KEY constant.')
        return
    
    try:
        example1_get_current_price()
        example2_get_multiple_stocks()
        example3_search_stocks()
        example4_get_historical_data()
        example5_portfolio_tracking()
        example6_error_handling()
        example7_rate_limiting()
        example8_technical_analysis()
        
        print('\n=== All examples completed! ===')
        
    except Exception as e:
        print(f'Example execution failed: {e}')

if __name__ == '__main__':
    main() 