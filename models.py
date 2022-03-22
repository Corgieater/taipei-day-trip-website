import flask_bcrypt
from flask import *
import math
from dotenv import load_dotenv, find_dotenv
import os
import mysql.connector
from mysql.connector import pooling, Error

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

# def returnUserInfo(){
#     pass
# #     check database to see if user exist?
# }

def signInFunc():
    userInputEmail = request.form.get('userEmail')
    userInputPassword = flask_bcrypt.generate_password_hash(request.form.get('userPassword'))
    print(userInputEmail, userInputPassword)
    return redirect('/')

def checkEmailDuplicate(userInputEmail):
    searchEmail = ("SELECT userName FROM taipeitripuserinfo WHERE userEmail = %s")
    cursor.execute(searchEmail, (userInputEmail,))
    result = cursor.fetchone()
    if result:
        return True


def signUpFunc():
    contentType = request.headers.get('Content-Type')
    if(contentType == 'application/json'):
        json = request.json
        print(json)
        userInputName = json['name']
        userInputEmail = json['email']
        userInputPassword = flask_bcrypt.generate_password_hash(json['password'])
        print(userInputName, userInputEmail, userInputPassword)
        if checkEmailDuplicate(userInputEmail):
            error = {
                'error': True,
                'message': 'Email already exists'
                }
            return error, 400
        createUser = ('INSERT INTO taipeitripuserinfo VALUES(%s, %s, %s, %s)')
        cursor.execute(createUser, (None, userInputName, userInputEmail, userInputPassword))
        connection.commit()
        data = {
                'ok': True
            }
        return data



        # try:
        #     cursor.execute(createUser, (None, userInputName, userInputEmail, userInputPassword))
        #
        # except mysql.connector.Error as err:
        #     if err.errno == 1062:
        #         print('1062')
        #         error = {
        #             'error': True,
        #             'message': 'Email already exists'
        #         }
        #         return error, 400
        #     # 我本來是想寫except 1062但寫在外面會跳沒有繼承base Exception然後我又不會繼承不知道該怎辦= =
        #     connection.rollback()
        #     error = {
        #         'error': True,
        #         'message': 'Internal server error'
        #     }
        #     return error, 500
        # else:
        #     data = {
        #         'ok': True
        #     }
        #     connection.commit()
        #     return data

    else:
        error = {
            'error': True,
            'message': 'Content-Type not support'
        }
        return error, 400

