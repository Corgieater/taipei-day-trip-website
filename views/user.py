from controllers.user import *

userBlueprint = Blueprint(
    'userBlueprint',
    __name__,
    static_folder='static',
    template_folder='templates'
)

@userBlueprint.route("/api/user", methods=['POST'])
def signUp():
	return signUpFunc()


@userBlueprint.route("/api/user", methods=['PATCH'])
def signIn():
	return signInFunc()


@userBlueprint.route('/api/user', methods=["GET"])
def checkUserInfo():
	return userChecker()


@userBlueprint.route("/api/user", methods=["DELETE"])
def signOut():
	return signOutFunc()