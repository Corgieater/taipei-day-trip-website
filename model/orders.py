from database.db import *

# 把訂單加入資料庫
def addOrderToDatabase(number, money, attIds, dates, times, name, email, phone, userId):
    try:
        createOrder = ('INSERT INTO orders VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)')
        values = (None, number, money, attIds, dates, times, name, email, phone, 0, userId)
        addOrUpdateData(createOrder, values)
    except Exception as e:
        print(e)
        return False
    else:
        return True

# 更新訂單付款資訊
def updateOrderStatus(orderNumber):
    try:
        updateOrder = ('UPDATE orders SET paid = 1 WHERE number = %s')
        addOrUpdateData(updateOrder, (orderNumber,))
    except Exception as e:
        print(e)
        return False
    else:
        return True


# 找order內容
def getOrderData(sql, orderNumber):
    try:
        results = getData(sql, (orderNumber,), 'all')
        if results:
            return results[0]
    except Exception as e:
        print(e)
        return False
