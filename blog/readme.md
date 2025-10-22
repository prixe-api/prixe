# Prixe News to GPT Analyzer

This Python script fetches recent news articles for a specified stock ticker (default: GLD) using the Prixe API, concatenates their content, and then uses OpenAI's GPT model to analyze the news and provide a simple yes/no recommendation on whether to buy the stock, along with a short explanation.

## Expert Stock Analysis Response from script

```
Fetching news for GLD...
Prixe Found 8 Articles
--------------------------------
Analyzing news with GPT...

--- AI Stock Analyst Verdict ---
No — record highs and extreme crowding/overbought (RSI ~83, record inflows/volume, “long gold” most crowded trade) point to elevated near-term pullback risk despite supportive long-term fundamentals.
```

## Requirements

- Python 3.x
- `requests` library (install via `pip install requests`)
- Prixe API key (set as environment variable `PRIXE_API_KEY`)
- OpenAI API key (set as environment variable `OPENAI_API_KEY`)

## Usage

1. Set your environment variables:
   ```
   export PRIXE_API_KEY=your_prixe_api_key
   export OPENAI_API_KEY=your_openai_api_key
   ```

2. Run the script:
   ```
   python prixe-news-to-gpt.py
   ```

   The script will fetch news for the default ticker "GLD". To change the ticker, modify the `ticker` parameter in the `fetch_news` function call in the script.

## How It Works

1. **Fetch News**: Sends a POST request to the Prixe API's news endpoint with the ticker symbol and API key.
2. **Process News**: Collects the bodies of the news articles if available.
3. **Analyze with GPT**: Sends the concatenated news content to OpenAI's chat completions API (default model: "gpt-5") with a system prompt to act as an expert stock analyst and provide a yes/no buy decision with a short explanation.
4. **Output**: Prints the GPT analysis.

## Notes

- Customize the GPT model or prompt in the `analyze_with_gpt` function as needed.
- For production use, consider adding more robust error handling and configuration options.


## Sample Prixe News API Response

```json
{
    "news_data": {
        "count": 2,
        "data": [
            {
                "body": "Pla2na/iStock via Getty Images  Pla2na/iStock via Getty Images $4,250. An impressive number on a chart, a number that makes most of us celebrate (or at least those who had the foresight to buy gold some time ago). Applause, we This article was written by Analyst’s Disclosure:I/we have a beneficial long position in the shares of GLD either through stock ownership, options, or other derivatives.I wrote this article myself, and it expresses my own opinions. I am not receiving compensation for it (other than from Seeking Alpha). I have no business relationship with any company whose stock is mentioned in this article. Seeking Alpha's Disclosure:Past performance is no guarantee of future results. No recommendation or advice is being given as to whether any investment is suitable for a particular investor. Any views or opinions expressed above may not reflect those of Seeking Alpha as a whole. Seeking Alpha is not a licensed securities dealer, broker or US investment adviser or investment bank. Our analysts are third party authors that include both professional investors and individual investors who may not be licensed or certified by any institute or regulatory body. Download app Contact us",
                "title": "GLD: Central Banks Are Dumping Dollars And HoardingGold- Strong Buy",
                "url": "https://seekingalpha.com/article/4830552-gld-central-banks-are-dumping-dollars-and-hoarding-gold-strong-buy"
            },
            {
                "body": "Investing Sending You to Google News in3 iShares Gold Trust ETF (NYSEARCA:IAU)had significantly outperformedSPDR S&P 500 ETF Trust (NYSEARCA:SPY)this year.While SPY has posted impressive gains of nearly 15% year-to-date—making this a stronger-than-average year for the S&P 500 with almost three months remaining—gold spot prices have made iShares Gold Trust a better investment so far in 2025. Spot gold prices have been explosive this year and have trounced even big-name tech stocks likeNvidia (NASDAQ:NVDA)year-to-date. For the long-term, cost-conscious investor,iShares Gold Trust ETFis a great bet. It has $61.5 billion in total assets and low fees at just 0.25%, or $25 per $10,000. Each share of IAU constitutes a fractional undivided interest in physical gold held in secure vaults by JPMorgan Chase Bank as the custodian. The gold is allocated, meaning it is specifically identified and held in the name of the trust. It’s ideal for investors who want direct gold price exposure without the hassle of buying, storing, or insuring bullion. IAU may not even be at its peak potential, as trends say that gold is set to continue going up. As of this writing, gold broke through $4,000/oz.",
                "title": "SPY Got Beat 3-To-1 By This ETF This Year",
                "url": "https://247wallst.com/investing/2025/10/07/spy-got-beat-3-to-1-by-this-etf-this-year/"
            }
        ],
        "search_text": "GLD SPDR GOLD TRUST",
        "status": "success",
        "ticker": "GLD"
    },
    "success": true
}
```
