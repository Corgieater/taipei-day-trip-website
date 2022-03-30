from flask import *
from models import modelsBlueprint
import os

environment = os.getenv('FLASK_ENV')
flask_host = os.getenv('FLASK_HOST')


app = Flask(
	__name__,
	static_folder='static',
	template_folder='templates'
)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

app.register_blueprint(modelsBlueprint)
from models import searchAttractions, searchAttractionById, signUpFunc, \
	signInFunc, userChecker, signOutFunc, doReservation, checkReservation, removeReservation

# Pages
@app.route("/")
def index():
	return render_template("index.html")

# -----景點資訊相關-----
@app.route("/api/attractions")
def searching():
	return searchAttractions()

@app.route("/api/attraction/<attractionId>")
def searchingById(attractionId):
	# dynamic route for fuck sake
	return searchAttractionById(attractionId)


# -----登入登出相關-----
@app.route("/api/user", methods=['POST'])
def signUp():
	return signUpFunc()


@app.route("/api/user", methods=['PATCH'])
def signIn():
	return signInFunc()


@app.route('/api/user', methods=["GET"])
def checkUserInfo():
	return userChecker()


@app.route("/api/user", methods=["DELETE"])
def signOut():
	return signOutFunc()


# -----預定相關-----
@app.route("/api/booking", methods=['GET'])
def getReservation():
	return checkReservation()

@app.route("/api/booking", methods=['POST'])
def makeReservation():
	return doReservation()

@app.route("/api/booking", methods=['DELETE'])
def deleteReservation():
	return removeReservation()

# ----don't touch-----

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

if __name__ == '__main__' and environment == 'developmente':
	app.run(debug=True, port=3000)
else:
	app.run(host=flask_host, port=3000)

