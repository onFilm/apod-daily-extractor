import json, requests

baseURL = 'https://apod.ellanan.com/api'
response = requests.get(baseURL)

with open("consolidated.json") as json_file:
    json_decoded = json.load(json_file)
    json_decoded["apod"].append(response.json())

with open('consolidated.json', 'w', encoding='utf-8') as f:
    json.dump(json_decoded, f, ensure_ascii=False, indent=4)