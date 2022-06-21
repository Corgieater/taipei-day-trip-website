from flask import *
from model.orders import *
import requests
import jwt
from datetime import datetime
import os

merchantID = os.getenv('MERCHANT_ID')
partnerKey = os.getenv('PARTNER_KEY')

# 把訂單存到資料庫
def saveOrderToDatabase(cartData ,number, money, name, email, phone, userId):
    attIds = []
    dates = []
    times = []
    for item in cartData['order']['trip']:
        attIds.append(item['attraction']['id'])
        dates.append(item['date'])
        times.append(item['time'])

    attIds = json.dumps(attIds)
    dates = json.dumps(dates)
    times = json.dumps(times)

    orderSaved = addOrderToDatabase(number, money, attIds, dates, times, name, email, phone, userId)
    if orderSaved:
        return True


# 打API給TAPPAY
def sendReqToTappay(partnerKey, paymentData):
    headers = {'Content-Type': 'application/json',
               'x-api-key': partnerKey}
    url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
    req = requests.post(url, data=json.dumps(paymentData), headers=headers)
    res = req.json()
    # 要轉json不然會是byte
    return res


# 把tappay資訊傳給前端
def sendTappayInfo():
    data = {
        'data': {
            'appId': os.getenv('APP_ID'),
            'appKey': os.getenv('APP_KEY')
        }
    }
    return data


def makeOrder():
    # 首先先確定使用者是否登入
    token = request.cookies.get('userInfo')
    decodeToken = jwt.decode(token, secretKey, algorithms=["HS256"])
    userId = decodeToken['userID']


    if userId:
        cartData = request.get_json()

        prime = cartData['prime']
        partnerKey = partnerKey
        number = datetime.now().strftime('%Y%m%d%H%M%S')+str(userId)

        money = cartData['order']['price']
        name = cartData['contact']['name']
        email = cartData['contact']['email']
        phone = cartData['contact']['phone']


        orderSaved = saveOrderToDatabase(cartData, number, money, name, email, phone, userId)

        paymentData = {
            "prime": prime,
            "partner_key": partnerKey,
            "merchant_id": merchantID,
            "details": "TapPay Test",
            "amount": money,
            "cardholder": {
                "phone_number": phone,
                "name": name,
                "email": email
            },
        }

        if orderSaved:
            payStatus = sendReqToTappay(partnerKey, paymentData)
            if payStatus['status'] == 0:
                orderPaid = updateOrderStatus(number)
                if orderPaid:
                    return{
                        'data': {
                            'number': number,
                            'payment': {
                                'status': 0,
                                'message': '付款成功'
                            }
                        }
                    }, 200
            else:
                return {
                    'error': True,
                    "message": "付款失敗，請確認付款資訊",
                    'number': number
                }
    else:
        return{
            'error': True,
            'message': '請先登入'
        }


# 確認訂單資訊
# string轉list 因為我資料庫有用type json 傳回來會全部變成str所以要做處理
def turnStringToList(strData):
    unwantedC = ['"', '[', ']', ',']

    for c in unwantedC:
        strData = strData.replace(c, '')
    list = strData.split(' ')
    return list

# 從database挖出來做成dict
def makeOrderDetails(orderNumber):
    searchOrder = 'SELECT * FROM orders WHERE number = %s'
    orderContent = getOrderData(searchOrder, orderNumber)
    print(orderContent)
    if orderContent:
        orderNum = orderContent[1]
        orderPrice = orderContent[2]
        orderAttIds = turnStringToList(orderContent[3])
        orderDates = turnStringToList(orderContent[4])
        orderTimes = turnStringToList(orderContent[5])

        orderName = orderContent[6]
        orderEmail = orderContent[7]
        orderPhone = orderContent[8]
        paymentStatus = orderContent[9]

        data = {
            "data": {
                "number": orderNum,
                "price": orderPrice,
                "trip": {
                    "attraction": []
                },
                "contact": {
                    "name": orderName,
                    "email": orderEmail,
                    "phone": orderPhone
                },
                "status": paymentStatus
            }
        }

        for i in range(len(orderAttIds)):
            attraction = {
                "id": orderAttIds[i],
                "name": None,
                "address": None,
                "image": None,
                "date": None,
                "time": None
            }
            # 這樣一直查不知道會不會爆炸
            attractionInfo = 'SELECT name, address, images FROM taipeitrip WHERE id = %s'
            result = getOrderData(attractionInfo, (i+1))
            attraction['name'] = result[0]
            attraction['address'] = result[1]
            image = result[2].split('https://')
            attraction['image'] = 'https://'+image[1][:-1]
            attraction['date'] = orderDates[i]
            attraction['time'] = orderTimes[i]
            data['data']['trip']['attraction'].append(attraction)

        return data
