from controllers.cart import *

cartBlueprint = Blueprint(
    'cartBlueprint',
    __name__,
    static_folder='static',
    template_folder='templates'
)

# 購物車
@cartBlueprint.route("/cart")
def cart():
	return render_template("cart.html")

# check cart and add to cart should be two func
@cartBlueprint.route('/api/cart', methods=['GET'])
def getCartItems():
	return checkCartItems()

# 給購物車計數用
@cartBlueprint.route('/api/cart/len', methods=['GET'])
def getCartLen():
	return checkCartLen()

@cartBlueprint.route('/api/cart', methods=['PATCH'])
def addItem():
	return addItemToCart()

@cartBlueprint.route('/api/cart/<cartId>', methods=['DELETE'])
def deleteItem(cartId):
	return deleteItemFromCart(cartId)