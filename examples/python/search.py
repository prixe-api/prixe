import requests

url = "https://api.prixe.io/api/search"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "query": "Tesla"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)
