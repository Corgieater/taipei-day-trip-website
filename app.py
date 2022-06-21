from flask import *
from views.attraction import attractionViewBlueprint
from views.user import userBlueprint
from views.booking import bookingBlueprint
from views.cart import cartBlueprint
from views.orders import ordersBlueprint
import os

environment = os.getenv('FLASK_ENV')
flaskHost = os.getenv('FLASK_HOST')


app = Flask(
	__name__,
	static_folder='static',
	template_folder='templates'
)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

app.register_blueprint(attractionViewBlueprint)
app.register_blueprint(userBlueprint)
app.register_blueprint(bookingBlueprint)
app.register_blueprint(cartBlueprint)
app.register_blueprint(ordersBlueprint)

# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

if __name__ == '__main__' and environment == 'developmente':
	app.run(debug=True, port=3000)
else:
	app.run(host=flaskHost, port=3000)

