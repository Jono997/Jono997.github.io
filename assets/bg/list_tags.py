import json

file = open("backgrounds.json")
backgrounds = json.load(file)
file.close()

tags = []
for background in backgrounds:
    for tag in background['tags']:
        if not tag in tags:
            print(tag)
            tags.append(tag)
input("...")