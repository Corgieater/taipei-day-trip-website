from controllers.booking import *

bookingBlueprint = Blueprint(
    'bookingBlueprint',
    __name__,
    static_folder='static',
    template_folder='templates'
)


@bookingBlueprint.route("/booking")
def booking():
	return render_template("booking.html")


@bookingBlueprint.route("/api/booking", methods=['GET'])
def getReservation():
    return checkReservation()
