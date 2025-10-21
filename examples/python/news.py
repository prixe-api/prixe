import requests

url = "https://api.prixe.io/api/news"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "ticker": "TSLA"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)
