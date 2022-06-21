from controllers.attraction import *

attractionViewBlueprint = Blueprint(
    'attractionViewBlueprint',
    __name__,
    static_folder='static',
    template_folder='templates'
)


@attractionViewBlueprint.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")


@attractionViewBlueprint.route("/api/attractions")
def searching():
    # return {'ok':True}
    return searchAttractions()


@attractionViewBlueprint.route("/api/attraction/<attractionId>")
def searchingById(attractionId):
    return searchAttractionById(attractionId)