import requests
import os, json

baseURL = 'https://apod.ellanan.com/api'
response = requests.get(baseURL)
print(response.status_code)
print(response.json())

with open("test.json") as json_file:
    json_decoded = json.load(json_file)
    json_decoded["apod"].append(response.json())


with open('test.json', 'w', encoding='utf-8') as f:
    json.dump(json_decoded, f, ensure_ascii=False, indent=4)
