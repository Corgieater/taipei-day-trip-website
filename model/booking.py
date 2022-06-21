from database.db import *

# 算有多少筆訂單
def countOrders(id):
    count = 'SELECT COUNT(*) FROM orders WHERE userId = %s'
    result = getData(count, (id,))

    return result[0]


def searchOrdersByUserIdAndPage(id, page):
    searchOrders = 'SELECT number FROM orders WHERE userId = %s LIMIT %s, 5'
    results = getData(searchOrders, (id, page), 'all')

    return results