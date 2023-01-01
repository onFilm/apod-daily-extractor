import os, json

with open("consolidated.json") as json_file:
    json_decoded = json.load(json_file)

dir_name = 'extracted_data/'
for file_name in [file for file in sorted(filter(lambda x: os.path.isfile(os.path.join(dir_name, x)), os.listdir(dir_name))) if file.endswith('.json')]:
  if os.stat(file_name).st_size != 0:
    with open(dir_name + file_name) as json_file:
      data = json.load(json_file)
      json_decoded["apod"].append(data)

with open('consolidated.json', 'w', encoding='utf-8') as f:
    json.dump(json_decoded, f, ensure_ascii=False, indent=4)