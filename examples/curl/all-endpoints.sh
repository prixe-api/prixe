#!/bin/bash

# Prixe Stock API - Complete cURL Examples
# This script demonstrates all API endpoints using cURL commands

# Configuration
API_KEY="${PRIXE_API_KEY:-YOUR_API_KEY}"
BASE_URL="https://api.prixe.io"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to make requests
make_request() {
    local endpoint="$1"
    local method="$2"
    local data="$3"
    local description="$4"
    
    echo -e "\n${BLUE}=== $description ===${NC}"
    echo -e "${YELLOW}Endpoint:${NC} $method $endpoint"
    
    if [ "$method" = "POST" ]; then
        echo -e "${YELLOW}Request:${NC} $data"
        echo -e "${YELLOW}Response:${NC}"
        curl -s -X POST "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" | jq '.' 2>/dev/null || echo "Failed to parse JSON response"
    else
        echo -e "${YELLOW}Response:${NC}"
        curl -s -X GET "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $API_KEY" | jq '.' 2>/dev/null || echo "Failed to parse JSON response"
    fi
    
    echo -e "${GREEN}Status: Done${NC}"
}

# Check if API key is set
if [ "$API_KEY" = "YOUR_API_KEY" ]; then
    echo -e "${RED}Error: Please set your API key in the PRIXE_API_KEY environment variable${NC}"
    echo "Example: export PRIXE_API_KEY='your_api_key_here'"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq is not installed. JSON responses will not be formatted.${NC}"
    echo "Install jq for better output formatting: https://stedolan.github.io/jq/download/"
fi

echo -e "${GREEN}Prixe Stock API - cURL Examples${NC}"
echo -e "${GREEN}===============================${NC}"
echo -e "API Key: ${API_KEY:0:10}...${API_KEY: -4}"
echo -e "Base URL: $BASE_URL"

# Example 1: Get Last Sold Price
make_request "/api/last_sold" "POST" '{"ticker": "AAPL"}' "Get Current Stock Price (Apple)"

# Example 2: Get Last Sold Price with Webhook
make_request "/api/last_sold" "POST" '{
    "ticker": "TSLA",
    "callback_url": "https://your-server.com/webhooks/price-callback"
}' "Get Current Stock Price with Webhook (Tesla)"

# Example 3: Search for Stocks by Company Name
make_request "/api/search" "POST" '{"query": "Tesla"}' "Search Stocks by Company Name"

# Example 4: Search for Stocks by Ticker
make_request "/api/search" "POST" '{"ticker": "MSFT"}' "Search Stocks by Ticker Symbol"

# Example 5: Search for Stocks by CUSIP
make_request "/api/search" "POST" '{"cusip": "88160R101"}' "Search Stocks by CUSIP"

# Example 6: Get Historical Price Data (30 days)
END_DATE=$(date +%s)
START_DATE=$((END_DATE - 30*24*60*60))

make_request "/api/price" "POST" "{
    \"ticker\": \"MSFT\",
    \"start_date\": $START_DATE,
    \"end_date\": $END_DATE,
    \"interval\": \"1d\"
}" "Get Historical Price Data (Microsoft - 30 days)"

# Example 7: Get Historical Price Data (7 days, hourly)
END_DATE=$(date +%s)
START_DATE=$((END_DATE - 7*24*60*60))

make_request "/api/price" "POST" "{
    \"ticker\": \"GOOGL\",
    \"start_date\": $START_DATE,
    \"end_date\": $END_DATE,
    \"interval\": \"1h\"
}" "Get Historical Price Data (Google - 7 days, hourly)"

# Example 8: Multiple Stock Prices (Portfolio)
echo -e "\n${BLUE}=== Portfolio Example (Multiple Stocks) ===${NC}"
TICKERS=("AAPL" "MSFT" "GOOGL" "AMZN" "TSLA")

for ticker in "${TICKERS[@]}"; do
    echo -e "\n${YELLOW}Getting price for $ticker...${NC}"
    curl -s -X POST "$BASE_URL/api/last_sold" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"ticker\": \"$ticker\"}" | \
        jq -r "\"$ticker: \" + .lastSalePrice + \" (\" + .percentageChange + \")\"" 2>/dev/null || \
        echo "$ticker: Failed to get price"
    sleep 0.1  # Rate limiting
done

# Example 9: Error Handling Examples
echo -e "\n${BLUE}=== Error Handling Examples ===${NC}"

echo -e "\n${YELLOW}Example: Missing ticker parameter${NC}"
curl -s -X POST "$BASE_URL/api/last_sold" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{}' | jq '.' 2>/dev/null || echo "Failed to parse response"

echo -e "\n${YELLOW}Example: Invalid ticker${NC}"
curl -s -X POST "$BASE_URL/api/last_sold" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"ticker": "INVALID"}' | jq '.' 2>/dev/null || echo "Failed to parse response"

echo -e "\n${YELLOW}Example: Invalid API key${NC}"
curl -s -X POST "$BASE_URL/api/last_sold" \
    -H "Authorization: Bearer invalid_key" \
    -H "Content-Type: application/json" \
    -d '{"ticker": "AAPL"}' | jq '.' 2>/dev/null || echo "Failed to parse response"

# Example 10: Rate Limiting Test
echo -e "\n${BLUE}=== Rate Limiting Test ===${NC}"
echo -e "${YELLOW}Making 5 rapid requests to test rate limiting...${NC}"

for i in {1..5}; do
    echo -n "Request $i: "
    START_TIME=$(date +%s%3N)
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/last_sold" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"ticker": "AAPL"}')
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    if [ "$STATUS" -eq 200 ]; then
        echo -e "${GREEN}Success${NC} (${DURATION}ms)"
    elif [ "$STATUS" -eq 429 ]; then
        echo -e "${RED}Rate Limited${NC} (${DURATION}ms)"
    else
        echo -e "${RED}Error $STATUS${NC} (${DURATION}ms)"
    fi
done

# Advanced Examples
echo -e "\n${BLUE}=== Advanced Examples ===${NC}"

# Example 11: Technical Analysis Data
echo -e "\n${YELLOW}Getting data for technical analysis...${NC}"
END_DATE=$(date +%s)
START_DATE=$((END_DATE - 90*24*60*60))  # 90 days

make_request "/api/price" "POST" "{
    \"ticker\": \"AAPL\",
    \"start_date\": $START_DATE,
    \"end_date\": $END_DATE,
    \"interval\": \"1d\"
}" "Technical Analysis Data (Apple - 90 days)"

# Example 12: Intraday Data
echo -e "\n${YELLOW}Getting intraday data...${NC}"
END_DATE=$(date +%s)
START_DATE=$((END_DATE - 24*60*60))  # 1 day

make_request "/api/price" "POST" "{
    \"ticker\": \"TSLA\",
    \"start_date\": $START_DATE,
    \"end_date\": $END_DATE,
    \"interval\": \"5m\"
}" "Intraday Data (Tesla - 1 day, 5-minute intervals)"

# X402 Payment Examples (Note: These require x402-fetch library)
echo -e "\n${BLUE}=== X402 Payment Examples (Requires x402-fetch) ===${NC}"
echo -e "${YELLOW}Note: These endpoints require x402 payment protocol and cannot be called directly with cURL${NC}"
echo -e "X402 endpoints:"
echo -e "  GET $BASE_URL/x402/last_sold?ticker=AAPL (\$0.001)"
echo -e "  GET $BASE_URL/x402/search?query=Tesla (\$0.001)"
echo -e "  GET $BASE_URL/x402/price?ticker=MSFT&start_date=...&end_date=...&interval=1d (\$0.005)"

# Summary
echo -e "\n${GREEN}=== Summary ===${NC}"
echo -e "✅ Basic API calls demonstrated"
echo -e "✅ Error handling examples shown"
echo -e "✅ Rate limiting tested"
echo -e "✅ Historical data examples provided"
echo -e "✅ Search functionality demonstrated"
echo -e ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Try the JavaScript examples: node examples/javascript/basic-usage.js"
echo -e "2. Try the Python examples: python examples/python/basic_usage.py"
echo -e "3. Explore X402 integration: node examples/x402-integration/complete-example.js"
echo -e "4. Read the documentation: docs/"
echo -e ""
echo -e "${GREEN}Happy trading! 📈${NC}" 