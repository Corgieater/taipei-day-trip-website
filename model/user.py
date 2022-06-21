from database.db import *
import flask_bcrypt

# 拿user資料
def getUserInfo(email, password):
    searchUserInfo = ("SELECT userPassword, Id, userName FROM taipeitripuserinfo WHERE userEmail = %s")
    userInfo = getData(searchUserInfo, (email,))

    if userInfo is None:
        return False

    if userInfo:
        hashedPassword = userInfo[0]
        checkPassword = flask_bcrypt.check_password_hash(hashedPassword, password)
        if checkPassword:
            userId = userInfo[1]
            userName = userInfo[2]
            return [userId, userName]


# 確認email是否重複
def checkEmailDuplicate(userInputEmail):
    searchEmail = ("SELECT userName FROM taipeitripuserinfo WHERE userEmail = %s")
    result = getData(searchEmail, (userInputEmail,))
    if result:
        return True


# 新增使用者資料到data
def addUserToData(name, email, password):
    createUser = ('INSERT INTO taipeitripuserinfo VALUES(%s, %s, %s, %s)')
    dataAdded = addOrUpdateData(createUser, (None, name, email, password))

    return dataAdded