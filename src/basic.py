import requests

baseURL = 'https://apod.ellanan.com/api'
response = requests.get(baseURL)
print(response.status_code)
print(response.json())
