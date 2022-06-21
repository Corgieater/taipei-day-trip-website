from controllers.orders import *

ordersBlueprint = Blueprint(
    'ordersBlueprint',
    __name__,
    static_folder='static',
    template_folder='templates'
)


@ordersBlueprint.route('/api/orders', methods=['POST'])
def makeNewOrder():
    return makeOrder()


@ordersBlueprint.route('/api/orfers/tappayInfo', methods=['GET'])
def getTappayInfo():
    return sendTappayInfo()


# 查詢訂單內容
@ordersBlueprint.route('/api/orders/<orderNumber>', methods=['GET'])
def getOrderDetails(orderNumber):
    return makeOrderDetails(orderNumber)
