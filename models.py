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
    userInputKeyword = request.args.get('keyword')
    userInputPage = request.args.get('page')

    errorData = {
        "error": True,
        "message": "Something is wrong, have you enter the right page number? Or maybe there is no page there"
    }
    errorDataForKeyword = {
        "error": True,
        "message": "Something is wrong, maybe there is no such keyword"
    }

    if userInputPage and userInputKeyword:
        ###### use limit to improve selecting######
        # maybe limit at 13 to see if there is next page?
        searchByPageAndNameKeyword = ('SELECT id, name, category, description, address, transport, mrt, latitude, '
                                      'longitude, images FROM taipeitrip WHERE name LIKE %s LIMIT %s,  12')
        countItemLength = ('SELECT COUNT(*) FROM taipeitrip WHERE name LIKE %s')
        # don't trans userInputPage here, page 0 will turn to False
        #search when user input page and keyword
        startPoint = 12*int(userInputPage)
        cursor.execute(searchByPageAndNameKeyword, ('%' + userInputKeyword + '%', startPoint, ))
        totalAttractions = cursor.fetchall()
        cursor.execute(countItemLength, ('%' + userInputKeyword + '%',))
        searchLength = cursor.fetchone()
        searchLength = searchLength[0]

        totalPages = math.ceil(searchLength/12)
        print(totalPages)
        # determine pages, really important
        if int(userInputPage) < totalPages:
            if int(userInputPage) == totalPages-1:
                totalData = makeJsonData(totalAttractions, len(totalAttractions))
                return totalData

            totalData = makeJsonData(totalAttractions, 12)
            totalData['nextPage'] = int(userInputPage)+1
            return totalData

        else:
            return errorDataForKeyword, 500

    elif userInputPage:
        search = 'SELECT COUNT(*) FROM taipeitrip'
        cursor.execute(search)
        totalAttractionLength = cursor.fetchone()
        totalAttractionLength = totalAttractionLength[0]
        totalPage = math.floor(totalAttractionLength/12)
        if int(userInputPage) <= totalPage:
            startPoint = 12 * (int(userInputPage))
            ##### use limit range to make mysql do less
            search = ('SELECT id, name, category, description, address, transport, mrt, latitude, '
                      'longitude, images FROM taipeitrip LIMIT %s, 12')
            cursor.execute(search, (startPoint,))
            totalAttractions = cursor.fetchall()
            if len(totalAttractions) < 12:
                totalData = makeJsonData(totalAttractions, len(totalAttractions))
                return totalData

            totalData = makeJsonData(totalAttractions, 12)

            if userInputPage != totalPage:
                totalData['nextPage'] = int(userInputPage)+1

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
            # how to deal with all these hard code index?
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
    searchById = ('SELECT id, name, category, description, address, transport, mrt, latitude, '
                  'longitude, images FROM taipeitrip WHERE id = %s')
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
        # can I find a way to fix this repetition?
        attraction = {
            "data": {
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

        }
    finally:
        return attraction
