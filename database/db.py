import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
MYSQL_DB_NAME = os.getenv('MYSQL_DB_NAME')
MYSQL_HOST = os.getenv('MYSQL_HOST')
MYSQL_USER = os.getenv('MYSQL_USER')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')

secretKey = os.getenv('SECRET_KEY')

pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name='myPool',
    pool_size=5,
    pool_reset_session=True,
    host=MYSQL_HOST,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    database=MYSQL_DB_NAME
)


# 拿資料 預設是fetchone
def getData(sql, value, dataAmount='one'):
    connection = pool.get_connection()
    try:
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute(sql, value)
            if dataAmount == 'one':
                result = cursor.fetchone()
            elif dataAmount == 'all':
                result = cursor.fetchall()

    except Exception as e:
        print(e)
    else:
        return result
    finally:
        cursor.close()
        connection.close()

# 新增資料
def addOrUpdateData(sql, value):
    connection = pool.get_connection()
    try:
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute(sql, value)

    except Exception as e:
        print(e)
        connection.rollback()
        return False
    else:
        connection.commit()
        return True
    finally:
        cursor.close()
        connection.close()
