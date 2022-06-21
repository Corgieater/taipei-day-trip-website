from flask import *
from model.booking import *
import jwt
import math


global startIndex
tartIndex = 0


# 取得預定行程
def checkReservation():
    token = request.cookies.get('userInfo')
    global startIndex
    # 使用者沒登入就不用try了
    if token is None:
        data = {
            'data': None
        }
        return data

    try:
        userInfo = jwt.decode(token, secretKey, algorithms=["HS256"])
        userId = userInfo['userID']

        if userId:
            orderLen = countOrders(userId)
            # 每頁放5個orders
            totalPages = math.ceil(orderLen/5)
            userInput = request.args.get('page')

            startIndex = 0
            if userInput:
                startIndex = int(userInput) * 5
            results = searchOrdersByUserIdAndPage(userId, startIndex)

            data = {
                'data': {
                    'userOrders': []
                },
                'totalPages': totalPages
            }

            for order in results:
                data['data']['userOrders'].append(order[0])
        else:
            data = {
                'error': True,
                'message': '請先登入'
            }

    except Exception as e:
        data = {
            'error': True,
            'message': 'Internal server error'
        }

    finally:
        return data
