from flask import *
import math
from dotenv import load_dotenv, find_dotenv
import os
import mysql.connector
from mysql.connector import pooling

modelsBlueprint = Blueprint(
    'models',
    __name__,
    static_folder='static',
    template_folder='templates'
)


load_dotenv(find_dotenv())
MYSQL_DB_NAME = os.getenv('MYSQL_DB_NAME')
MYSQL_HOST = os.getenv('MYSQL_HOST')
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')

pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name='myPool',
    pool_size=3,
    pool_reset_session=True,
    host=MYSQL_HOST,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    database=MYSQL_DB_NAME
)

connection = pool.get_connection()
cursor = connection.cursor()

def searchAttractions():
    searchByPageAndNameKeyword = ('SELECT id, name, category, description, address, transport, mrt, latitude, '
                                  'longitude, images FROM taipeitrip WHERE name LIKE %s')
    userInputKeyword = request.args.get('keyword')
    userInputPage = request.args.get('page')
    countItemLength = ('SELECT COUNT(*) FROM taipeitrip WHERE name LIKE %s')
    # don't trans userInputPage here, page 0 will turn to False
    nextPage = None

    errorData = {
        "error": True,
        "message": "Something is wrong, have you enter page number? Or maybe there is no page there"
    }

    if userInputPage and userInputKeyword:
        #search when user input page and keyword
        cursor.execute(searchByPageAndNameKeyword, ('%' + userInputKeyword + '%',))

        totalAttractions = cursor.fetchall()
        cursor.execute(countItemLength, ('%' + userInputKeyword + '%',))
        searchLength = cursor.fetchone()
        searchLength = searchLength[0]

        totalPages = math.ceil(searchLength/11)
        if int(userInputPage) < totalPages:
            if totalPages > 1 and int(userInputPage) < totalPages:
                if int(userInputPage) == 0:
                    # userInput = 0, but total pages > 1 = item > 11
                    totalData = makeJsonData(totalAttractions, 11)
                    # show whole page with 11 itmes

            elif int(userInputPage) == 0 and totalPages == 1:
                # user input = 0 and total pages > 1 = item <= 11
                totalData = makeJsonData(totalAttractions, searchLength)

            return totalData
        else:
            # 我們的頁數從0開始, 兩頁 = 0, 1, 如果userinputpage >=2就error
            return errorData, 500

    elif userInputPage:
        #if user only input page
        search = ('SELECT id, name, category, description, address, transport, mrt, latitude, '
                  'longitude, images FROM taipeitrip')
        cursor.execute(search)
        totalAttractions = cursor.fetchall()
        search = 'SELECT COUNT(*) FROM taipeitrip'
        cursor.execute(search)
        totalAttractionLength = cursor.fetchone()
        totalAttractionLength = totalAttractionLength[0]
        totalPage = math.ceil(totalAttractionLength/11)
        # # hard coded but ok, try to fix it in a smart way after job done, I think it can be iterate
        if int(userInputPage) < totalPage-1:
            #total page -1 because we have 58 items / 11 to ceil will be 6 pages,
            #but we start from 0, 0-4
            if int(userInputPage) == 0:
                # search = ('SELECT * FROM taipeitrip WHERE id < 12')
                totalData = makeJsonData(totalAttractions, 11)
                nextPage = 1
                totalData['nextPage'] = nextPage

            elif int(userInputPage) == 1:
                totalData = makeJsonData(totalAttractions, 23, 12)
                nextPage = 2
                totalData['nextPage'] = nextPage
                return totalData

            elif int(userInputPage) == 2:
                totalData = makeJsonData(totalAttractions, 35, 24)
                nextPage = 3
                totalData['nextPage'] = nextPage
                return totalData

            elif int(userInputPage) == 3:
                totalData = makeJsonData(totalAttractions, 47, 36)
                nextPage = 4
                totalData['nextPage'] = nextPage
                return totalData

            elif int(userInputPage) == 4:
                totalData = makeJsonData(totalAttractions, 58, 48)
                nextPage = None
                totalData['nextPage'] = nextPage
                return totalData
        else:
            return errorData, 500

def makeJsonData(totalAttractions, end, start=0):
    totalAttractionsData = {
        "nextPage": None,
        "data": []
    }
    for index in range(start, end):
        attraction = {
            "id": totalAttractions[index][0],
            "name": totalAttractions[index][1],
            "category": totalAttractions[index][2],
            "description": totalAttractions[index][3],
            "address": totalAttractions[index][4],
            "transport": totalAttractions[index][5],
            "mrt": totalAttractions[index][6],
            "latitude": totalAttractions[index][7],
            "longitude": totalAttractions[index][8],
            "images": totalAttractions[index][9].split(',')
        }
        totalAttractionsData['data'].append(attraction)
    return totalAttractionsData


def searchAttractionById(attractionId):
    searchById = ('SELECT * FROM taipeitrip WHERE id =%s')
    attraction = {}

    try:
        cursor.execute(searchById, (attractionId,))
        result = cursor.fetchone()
        if result is None:
            attraction = {
                        "error": True,
                        "message": 'There is no such id'
                    }, 400
    except:
        # except with no clear error is not ok, but i can't think of any other exception~"~
        attraction = {
                             "error": True,
                             "message": 'Internal server error'
                         }, 500
    else:
        attraction = {
            "id": result[0],
            "name": result[1],
            "category": result[2],
            "description": result[3],
            "address": result[4],
            "transport": result[5],
            "mrt": result[6],
            "latitude": result[7],
            "longitude": result[8],
            "images": result[9].split(',')
        }
    finally:
        return attraction
