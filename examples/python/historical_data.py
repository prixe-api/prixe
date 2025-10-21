import requests

url = "https://api.prixe.io/api/price"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "ticker": "MSFT",
    "start_date": 1735828200,
    "end_date": 1745328600,
    "interval": "1d"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)
