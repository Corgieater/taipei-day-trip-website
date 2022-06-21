from flask import *
from model.attraction import *
# 因為有models.py在所以一直抓不到models資料夾 先把它改成model


# 配合搜尋attractions的小功能
# 做回傳給前端的景點json檔
def makeJsonData(totalAttractions, end):
    totalAttractionsData = {
        "nextPage": None,
        "data": []
    }
    for index in range(0, end):
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

    # 使用者輸入關鍵字和頁碼
    if userInputPage and userInputKeyword:
        results = getAttractionByPageAndKeyword(userInputPage, userInputKeyword)
        isNextPage = results[0]
        attractions = results[1]

        if not isNextPage:
            # 沒下一頁了 有可能景點數量<=12
            totalData = makeJsonData(attractions, len(attractions))
            return totalData

        if isNextPage:
            # 因為我抓13筆資料來驗證有沒有下一頁所以在做json end point要-1
            totalData = makeJsonData(attractions, len(attractions)-1)
            totalData['nextPage'] = int(userInputPage) + 1
            return totalData

        else:
            return errorDataForKeyword, 500

    # 使用者輸入頁碼
    elif userInputPage:
        results = getAttractionByPageAndKeyword(userInputPage, '')
        isNextPage = results[0]
        attractions = results[1]

        if not isNextPage:
            # 沒下一頁了 有可能景點數量<=12
            totalData = makeJsonData(attractions, len(attractions))
            return totalData
        if isNextPage:
            totalData = makeJsonData(attractions, len(attractions) - 1)
            totalData['nextPage'] = int(userInputPage) + 1
            return totalData

        else:
            return errorData, 500


def searchAttractionById(attractionId):
    attraction = {}

    try:
        result = getAttractionById(attractionId)
        if result is None:
            attraction = {
                             "error": True,
                             "message": 'There is no such id'
                         }
    except Exception as e:
        # except with no clear error is not ok, but i can't think of any other exception~"~
        print(e)
        attraction = {
                         "error": True,
                         "message": 'Internal server error'
                     }, 500
    else:
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