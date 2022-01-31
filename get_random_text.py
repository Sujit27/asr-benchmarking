import json
import random

def get_text(file_name,lang):

    with open(file_name) as f:
        data=json.load(f)
    return random.choice(data[lang])

#print(get_text('/home/test/Downloads/example.json','en'))