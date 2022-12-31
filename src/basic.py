import requests
import os, json

baseURL = 'https://apod.ellanan.com/api'
response = requests.get(baseURL)
print(response.status_code)
print(response.json())

consolidated_data = []
path_to_json = 'extracted_data/'
for file_name in [file for file in os.listdir(path_to_json) if file.endswith('.json')]:
  with open(path_to_json + file_name) as json_file:
    print(path_to_json + file_name)
    data = json.load(json_file)
    consolidated_data.append(data)

with open('consolidated.json', 'w', encoding='utf-8') as f:
    json.dump(consolidated_data, f, ensure_ascii=False, indent=4)
