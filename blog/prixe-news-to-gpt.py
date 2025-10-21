import requests
import json
import os

def fetch_news(api_key, ticker="GLD"):
    """Fetches news for a given stock ticker from the Prixe API."""
    print(f"Fetching news for {ticker}...")
    url = "https://api.prixe.io/api/news"
    headers = {'Authorization': f"Bearer {api_key}"}
    payload = {"ticker": ticker}
    
    response = requests.post(url, headers=headers, json=payload)
    data = response.json()
    
    all_news = []
    if data.get("success"):
        news_items = data.get("news_data", {}).get("data", [])
        print(f"Found {len(news_items)} Articles")
        print("--------------------------------")
        for item in news_items:
            if item.get("body"):
                all_news.append(item.get("body"))
    
    return "\n".join(all_news)

def analyze_with_gpt(api_key, news_content, model="gpt-5"):
    """Sends news content to OpenAI's GPT for analysis."""
    print("Analyzing news with GPT...")
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {api_key}",
    }
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are an Expert Stock Analyst. Give me a yes or no answer on if you would buy the stock based on the content. Give me a short explanation for your answer. return only the answer, no other text."
            },
            {
                "role": "user",
                "content": news_content
            }
        ]
    }

    response = requests.post(url, headers=headers, json=payload)
    gpt_response = response.json()
    
    return gpt_response.get("choices")[0].get("message").get("content")

def main():
    """Main function to run the news fetching and analysis."""
    prixe_api_key = os.getenv("PRIXE_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")
        
    # 1. Fetch news from Prixe
    all_news_string = fetch_news(prixe_api_key)

    # 2. Feed the news to the GPT model for analysis
    if all_news_string:
        analysis = analyze_with_gpt(openai_api_key, all_news_string)
        print("\n--- AI Stock Analyst Verdict ---")
        print(analysis)
        print("------------------------------")

if __name__ == "__main__":
    main() 