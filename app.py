from flask import *
from models import modelsBlueprint




# app = Blueprint(
# 	'app',
# 	__name__,
# 	static_folder='static',
# 	template_folder='templates'
# )



app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

app.register_blueprint(modelsBlueprint)
from models import searchAttractions, searchAttractionById

# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/api/attractions")
def searching():
	return searchAttractions()

@app.route("/api/attraction/<attractionId>")
def searchingById(attractionId):
	# dynamic route for fuck sake
	return searchAttractionById(attractionId)

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

# app.run(port=3000)

if __name__ == '__main__':
    app.run(debug=True, port=3000)
    # connection.close()
    # mycursor.close()