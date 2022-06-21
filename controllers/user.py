from flask import *
import jwt
from model.user import *
from datetime import timedelta


# 確認使用者是否登入
def userChecker():
    token = request.cookies.get('userInfo')
    try:
        data = jwt.decode(token, secretKey, algorithms=["HS256"])
    except:
        return {
            'data': None
        }
    return jsonify(data)


# 登入功能
def signInFunc():
    try:
        data = request.get_json()
        userInputEmail = data['email']
        userInputPassword = data['password']
        result = getUserInfo(userInputEmail, userInputPassword)

        if result:
            dataDict = {
                'userID': result[0],
                'userName': result[1],
                'userEmail': userInputEmail
            }
            token = jwt.encode(dataDict, secretKey, algorithm='HS256')

            data = {
                'ok': True
            }
            res = make_response(data, 200)
            res.set_cookie('userInfo', token, timedelta(days=7))
            return res
        else:
            error = {
                'error': True,
                'message': '信箱或密碼不符'
            }
            return error
    except:
        error = {
            'error': True,
            'message': 'Internal server error'
        }
        return error, 500


# 註冊功能
def signUpFunc():
    data = request.json
    userInputName = data['name']
    userInputEmail = data['email']
    userInputPassword = flask_bcrypt.generate_password_hash(data['password'])

    if checkEmailDuplicate(userInputEmail):
        error = {
            'error': True,
            'message': '信箱已被使用'
        }
        return error, 400

    dataAdded = addUserToData(userInputName, userInputEmail, userInputPassword)

    if dataAdded:
        data = {
            'ok': True
        }
        return data, 200
    else:
        error = {
            'error': True,
            'message': 'Internal server error'
        }
        return error, 500


# 登出
def signOutFunc():
    data = {
        'ok': True
    }
    res = Response(data)
    res.set_cookie(key='userInfo', value='', expires=0)
    return res
