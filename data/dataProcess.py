import json
import re
from dotenv import load_dotenv, find_dotenv
import os
import mysql.connector

# 遇到的問題:
# 1. sql不能存list
# 2. 字串處理上忘了reset, 東西都卡在一起檔案很大, 以後要更注意reset to empty string的動作不然for下去一堆~"~
# 3. 想一下test到底是要用短中長?


load_dotenv(find_dotenv())
MYSQL_DB_NAME = os.getenv('MYSQL_DB_NAME')
MYSQL_HOST = os.getenv('MYSQL_HOST')
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')

mydb = mysql.connector.connect(
    host=MYSQL_HOST,
    database=MYSQL_DB_NAME,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD
)

cursor = mydb.cursor()
datas = []

# do encoding or can't process since it CN
with open('taipei-attractions.json', 'r', encoding='utf8') as jsonFile:
    data = json.load(jsonFile)
    data = data['result']['results']


    for area in data:
        name = area['stitle']
        category = area['CAT2']
        description = area['xbody']
        address = area['address']
        transport = area['info']
        mrt = area['MRT']
        latitude = area['latitude']
        longitude = area['longitude']
        imagesString = ''
        imageAddresses = area['file'].split('https://')

        for imageAddress in imageAddresses:
            fullAddress=''
            if re.search('.jpg', imageAddress, re.IGNORECASE) is not None or \
                    re.search('.png', imageAddress, re.IGNORECASE) is not None:
                fullAddress = 'https://'+imageAddress+','
                imagesString += fullAddress

        imagesString = imagesString[:-1]

        neatData = (name, category, description, address, transport, mrt, latitude,
                    longitude, imagesString)
        datas.append(neatData)

sql = ('INSERT INTO taipeitrip (id, name, category, description, address, transport, '
           'mrt, latitude, longitude, images) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s, %s)')
for stuff in datas:
    cursor.execute(sql, stuff)

mydb.commit()
mydb.close()
cursor.close()

