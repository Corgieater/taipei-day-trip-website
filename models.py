import flask_bcrypt
from flask import *
import math
from dotenv import load_dotenv, find_dotenv
import os
import mysql.connector
from mysql.connector import pooling
import jwt
from datetime import datetime, timedelta
# import datetime


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

secretKey = os.getenv('SECRET_KEY')

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


# -----登入功能------
# 登入相關小功能
def checkUserInfoThenReturnInfo(email, password):
    searchUserInfo = ("SELECT userPassword, Id, userName FROM taipeitripuserinfo WHERE userEmail = %s")
    cursor.execute(searchUserInfo, (email,))
    userInfo = cursor.fetchone()

    if userInfo is None:
        return False

    if userInfo:
        hashedPassword = userInfo[0]
        checkPassword = flask_bcrypt.check_password_hash(hashedPassword, password)
        if checkPassword:
            userId = userInfo[1]
            userName = userInfo[2]
            return [userId, userName]


def userChecker():
    token = request.cookies.get('userInfo')
    try:
        data = jwt.decode(token, secretKey, algorithms=["HS256"])
    except:
        return {
            'data': None
        }

    return jsonify(data)


def signInFunc():
    try:
        data = request.get_json()
        userInputEmail = data['email']
        userInputPassword = data['password']
        result = checkUserInfoThenReturnInfo(userInputEmail, userInputPassword)

        if result:
            dataDict = {
                'userID': result[0],
                'userName': result[1],
                'userEmail': userInputEmail
            }
            token = jwt.encode(dataDict, secretKey, algorithm='HS256')

            data = {
                'ok': True
            }
            res = make_response(data, 200)
            # upon equal to return data, 200
            res.set_cookie('userInfo', token, timedelta(days=31))
            return res
        else:
            error = {
                'error': True,
                'message': '信箱或密碼不符'
            }
            return error
    except:
        error = {
            'error': True,
            'message': 'Internal server error'
        }
        return error, 500


# 註冊相關

def checkEmailDuplicate(userInputEmail):
    searchEmail = ("SELECT userName FROM taipeitripuserinfo WHERE userEmail = %s")
    cursor.execute(searchEmail, (userInputEmail,))
    result = cursor.fetchone()
    if result:
        return True


def signUpFunc():
    data = request.json
    userInputName = data['name']
    userInputEmail = data['email']
    userInputPassword = flask_bcrypt.generate_password_hash(data['password'])

    if checkEmailDuplicate(userInputEmail):
        error = {
            'error': True,
            'message': '信箱已被使用'
            }
        return error, 400

    try:
        createUser = ('INSERT INTO taipeitripuserinfo VALUES(%s, %s, %s, %s)')
        cursor.execute(createUser, (None, userInputName, userInputEmail, userInputPassword))
        connection.commit()
        data = {
                'ok': True
            }
        return data, 200
    except:
        error = {
            'error': True,
            'message': 'Internal server error'
        }
        return error, 500


# 登出

def signOutFunc():
    data = {
        'ok': True
    }
    res = Response(data)
    res.set_cookie(key='userInfo', value='', expires=0)
    return res


# 取得預定行程
def checkReservation():
    token = request.cookies.get('userReservation')
    # 如果使用者根本沒預定就連try都不用了
    if token is None:
        data = {
            'data': None
        }
        return data

    try:
        userReservation = jwt.decode(token, secretKey, algorithms=["HS256"])

        if userReservation:
            attractionId = userReservation['attractionId']
            attraction = searchAttractionById(attractionId)['data']
            attractionName = attraction['name']
            attractionAddress = attraction['address']
            attractionImg = attraction['images'][0]
            data = {
                'data': {
                    'attraction': {
                        'id': attractionId,
                        'name': attractionName,
                        'address': attractionAddress,
                        'image': attractionImg
                    },
                    'date': userReservation['date'],
                    'time': userReservation['time'],
                    'price': userReservation['price']
                }
            }

    except:
        data = {
            'error': True,
            'message': '請先登入'
        }

    finally:
        return data

# 預定行程

def doReservation():
    token = request.cookies.get('userInfo')
    try:
        userInfo = jwt.decode(token, secretKey, algorithms=["HS256"])
        if userInfo:
            userReservation = request.json
            jwtEncoded = jwt.encode(userReservation, secretKey, algorithm="HS256")
            userReservationDate = userReservation['date']
            today = str(datetime.today().date())
            print(userReservationDate, today)
            # 轉str因為datetime這功能回的東西type不是str
            if userReservationDate <= today:
                data = {
                    'error': True,
                    'message': '請勿預定過去或當日的日期'
                }
                return data, 400

            data = {
                "ok": True
            }
            res = make_response(data)
            res.set_cookie('userReservation', jwtEncoded, timedelta(days=31))

            return res, 200

    except :
        data = {
            'error': True,
            'message': '請先登入'
        }
        return data, 403




# 刪除預定
def removeReservation():
    token = request.cookies.get('userInfo')
    userInfo = jwt.decode(token, secretKey, algorithms=["HS256"])
    if userInfo:
        data = {
            'ok': True
        }
        res = make_response(data)
        res.set_cookie('userReservation', value='', expires=0)
        return res, 200
    else:
        data = {
            'error': True,
            'message': '要登出的話要先登入喔:('
        }
        return data, 403

