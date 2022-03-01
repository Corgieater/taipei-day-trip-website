from flask import *
import math
from dotenv import load_dotenv, find_dotenv
import os
import mysql.connector
from mysql.connector import pooling

# 500 = 伺服器內部錯誤 所以要try catch final?

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

# select id, name, description from taipeitrip where name like '%北投%' or description like '%萬華%';; this is ok
def searchAttractions():
    searchByPageAndNameKeyword = ('SELECT * FROM taipeitrip WHERE name LIKE %s')
    # 以下測試用, 把作業寫完老師看完再改,先用name頂著用~"~
    # searchByPageAndNameKeyword = ('SELECT * FROM taipeitrip WHERE category LIKE %s')
    # sql = ('SELECT id, name, description FROM taipeitrip WHERE name LIKE %s')
    userInputKeyword = request.args.get('keyword')
    userInputPage = request.args.get('page')
    # don't trans userInputPage here, page 0 will turn to False, for fuck sake
    nextPage = None
    # totalPages = None

    errorData = {
        "error": True,
        "message": "Something is wrong, have you enter page number? Or maybe there is no page there"
    }

    #sudo
    # if userInputPage:
    #     show 12 items per page with no keyword so it will be id 1-12
    #     if userInputKeyword:
    #         show page and 12 items per page with wright keyword
    # else:
    # page is required so show message 500 error

    if userInputPage and userInputKeyword:
        # http://127.0.0.1:3000/searchattractions?page=1&keyword=%E5%8C%97%E6%8A%95
        print(userInputPage, userInputKeyword)
        cursor.execute(searchByPageAndNameKeyword, ('%' + userInputKeyword + '%',))

        totalAttractions = cursor.fetchall()
        print(totalAttractions)
        totalAttractionsLen = len(totalAttractions)
        print(f'total attractions len = {totalAttractionsLen}')

        # for attraction in totalAttrations(長度):
            # 插入資料
        # 如果下一頁就-11?
        # attraction = {}
        # ***找到共通點, 如何使用聰明的方法變換頁碼跟偵測userinput?

        totalPages = math.ceil(totalAttractionsLen / 11)
        totalPagesList = []
        for i in range(totalPages):
            totalPagesList.append(i)
        print(f'total page list = {totalPagesList}')
        print(f'Total pages = {totalPages}')
        if int(userInputPage) < totalPages:
            # 以keyword category 文館來說 總共有18個items, 會分成兩頁
            # if userInputPage == 0:
            if int(userInputPage) in totalPagesList:
                # ***如果顯示的結果<11那這樣寫OK, 但如果>11這會出問題(會超過11)

                if int(userInputPage) == 0 and totalPages > 1:
                    print(f'new total attractionlen = {totalAttractionsLen}')
                    totalData = makeJsonData(totalAttractions, 11)
                    # totalData['data'].append(attraction)
                    print(totalPages-1)
                    print(f'userinput page = {userInputPage}')
                elif int(userInputPage) == 0 and totalPages == 1:
                    print(f'new total attractionlen = {totalAttractionsLen}')
                    totalData = makeJsonData(totalAttractions, totalAttractionsLen)
                    print(totalPages-1)
                    print(f'userinput page = {userInputPage}')
                else:
                    print('else')
                    totalAttractionsLen -= (int(userInputPage)+1 * 11)
                    print(totalAttractionsLen)
                    totalData = makeJsonData(totalAttractions, totalAttractionsLen)
                if int(userInputPage) == totalPages-1:
                    totalData['nextPage'] = None
                else:
                    totalData['nextPage'] = int(userInputPage)+1
            elif int(userInputPage) == 1:
                totalAttractionsLen -= 11
                totalData = makeJsonData(totalAttractions, totalAttractionsLen)
                if userInputPage == totalPages - 1:
                    totalData['nextPage'] = None
                else:
                    totalData['nextPage'] = int(userInputPage) + 1
        else:
            # 我們的頁數從0開始, 兩頁 = 0, 1, 如果userinputpage >=2就error
            return errorData, 500
        return totalData

    elif userInputPage:
        # hard coded but ok, try to fix it in a smart way after job done
        if int(userInputPage) == 0:
            search = ('SELECT * FROM taipeitrip WHERE id < 12')
            nextPage = 1

        elif int(userInputPage) == 1:
            search = ('SELECT * FROM taipeitrip WHERE id >= 12 AND id < 23')
            nextPage = 2

        elif int(userInputPage) == 2:
            search = ('SELECT * FROM taipeitrip WHERE id >= 23 AND id < 34')
            nextPage = 3

        elif int(userInputPage) == 3:
            search = ('SELECT * FROM taipeitrip WHERE id >= 34 AND id < 45')
            nextPage = 4

        elif int(userInputPage) == 4:
            search = ('SELECT * FROM taipeitrip WHERE id >= 45 AND id < 59')
            nextPage = None

        # 一頁12個全部58個
        # http://127.0.0.1:3000/searchattractions?page=1
        # search = ('SELECT * FROM taipeitrip WHERE id < 12')
        cursor.execute(search)
        totalAttractions = cursor.fetchall()
        totalData = makeJsonData(totalAttractions, len(totalAttractions))
        totalData['nextPage'] = nextPage

        print(totalData)
        print(totalData['nextPage'])

        return totalData
    else:
        return errorData, 500


def makeJsonData(totalAttractions, length):
    totalAttractionsData = {
        "nextPage": None,
        "data": []
    }
    for index in range(length):
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
    print(attractionId)
    searchById = ('SELECT * FROM taipeitrip WHERE id =%s')
    attraction = {}

    # try this
    try:
        cursor.execute(searchById, (attractionId,))
        result = cursor.fetchone()
        if result is None:
            attraction = {
                        "error": True,
                        "message": 'There is no such id'
                    }, 400
    except ValueError:
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

    # try:
    #     attractionId = int(attractionId)
    #     cursor.execute(searchById, (attractionId,))
    #     result = cursor.fetchone()
    # except ValueError:
    #     attraction = {
    #                      "error": True,
    #                      "message": 'Internal web error'
    #                  }, 500

    # except TypeError:
    #     attraction = {
    #             "error": True,
    #             "message": 'There is no such id'
    #         }, 400
    # else:
    #     attraction = {
    #                      "id": result[0],
    #                      "name": result[1],
    #                      "category": result[2],
    #                      "description": result[3],
    #                      "address": result[4],
    #                      "transport": result[5],
    #                      "mrt": result[6],
    #                      "latitude": result[7],
    #                      "longitude": result[8],
    #                      "images": result[9].split(',')
    #                  }, 200
    # finally:
    #     return attraction

    # if result is None:
    #     attraction = {
    #         "error": True,
    #         "message": 'There is no such id'
    #     }
    #     return attraction, 400
    # else:
    #     attraction = {
    #         "id": result[0],
    #         "name": result[1],
    #         "category": result[2],
    #         "description": result[3],
    #         "address": result[4],
    #         "transport": result[5],
    #         "mrt": result[6],
    #         "latitude": result[7],
    #         "longitude": result[8],
    #         "images": result[9].split(',')
    #     }
    #     return attraction



