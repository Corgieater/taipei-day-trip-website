from flask import *
from model.cart import *
import jwt
import requests
import os

flaskHost = os.getenv('FLASK_HOST')

# 檢查購物車token
def checkCartItems():
    token = request.cookies.get('userCart')
    # 如果使用者根本沒預定就連try都不用了
    if token is None:
        data = {
            'data': None
        }
        return data

    userCart = jwt.decode(token, secretKey, algorithms=["HS256"])
    userCart = userCart['data']

    cartItemCollection = {'data': []}
    if userCart:
        for i in range(len(userCart)):
            item = userCart[i]
            attractionId = item['attractionId']
            url = 'http://'+flaskHost+':3000/api/attraction/' + attractionId
            req = requests.get(url)
            attraction = req.json()
            attraction = attraction['data']
            attractionName = attraction['name']
            attractionAddress = attraction['address']
            attractionImg = attraction['images'][0]

            item = {'attraction': {
                'id': attractionId,
                'name': attractionName,
                'address': attractionAddress,
                'image': attractionImg
            },
                'date': userCart[i]['date'],
                'time': userCart[i]['time'],
                'price': userCart[i]['price'],

            }
            cartItemCollection['data'].append(item)


    return cartItemCollection


# 確認購物車有多少品項
def checkCartLen():
    token = request.cookies.get('userCart')
    if token:
        try:
            decode = jwt.decode(token, secretKey, algorithms=['HS256'])
            cartLen = len(decode['data'])
            data = {
                'data': {'len': cartLen}
            }
        except Exception as e:
            print(e)
            data = {
                'error': True,
                'message': 'Token有誤'
            }
        finally:
            return data

    else:
        return {
            'error': True,
            'message': '購物車沒東西'
        }



# 加入購物車
def addItemToCart():
    userInput = request.get_json()
    data = {
        'data': []
    }
    token = None
    try:
        userCart = request.cookies.get('userCart')
        if userCart is None:
            data['data'].append(userInput)
            token = jwt.encode(data, secretKey, algorithm='HS256')
        else:
            decodeCart = jwt.decode(userCart, secretKey, algorithms=['HS256'])
            decodeCart['data'].append(userInput)
            token = jwt.encode(decodeCart, secretKey, algorithm='HS256')
    finally:
        res = make_response({'ok': True})
        res.set_cookie('userCart', token)

        return res

# 從購物車移除
def deleteItemFromCart(cartId):
    cartId = int(cartId)
    token = request.cookies.get('userInfo')
    userInfo = jwt.decode(token, secretKey, algorithms=["HS256"])
    if userInfo:
        data = {
            'ok': True
        }

        cartToken = request.cookies.get('userCart')
        decodedCart = jwt.decode(cartToken, secretKey, algorithms=["HS256"])
        del decodedCart['data'][cartId]
        newToken = jwt.encode(decodedCart, secretKey, algorithm="HS256")
        res = make_response(data)
        res.set_cookie('userCart', newToken)

        return res, 200
    else:
        data = {
            'error': True,
            'message': '要登出的話要先登入喔:('
        }
        return data, 403