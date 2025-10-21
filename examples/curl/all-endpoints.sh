#!/bin/bash

# Prixe API cURL Examples
# Replace YOUR_API_KEY with your actual API key.

API_KEY="YOUR_API_KEY"
BASE_URL="https://api.prixe.io/api"

# --- Last Sold Price ---
echo "--- Fetching Last Sold Price for TSLA ---"
curl -X POST "$BASE_URL/last_sold" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "TSLA"}'
echo -e "\n"

# --- Historical Price ---
echo "--- Fetching Historical Price for MSFT ---"
curl -X POST "$BASE_URL/price" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "MSFT", "start_date": 1735828200, "end_date": 1745328600, "interval": "1d"}'
echo -e "\n"

# --- Search ---
echo "--- Searching for 'Tesla' ---"
curl -X POST "$BASE_URL/search" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Tesla"}'
echo -e "\n"

# --- Fetch News ---
echo "--- Fetching News for TSLA ---"
curl -X POST "$BASE_URL/news" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "TSLA"}'
echo -e "\n" 