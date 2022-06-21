from database.db import *


def getAttractionByPageAndKeyword(page, keyword=''):
    isNextPage = None
    searchByPageAndNameKeyword = ('SELECT id, name, category, description, address, transport, mrt, latitude, '
                                  'longitude, images FROM taipeitrip WHERE name LIKE %s LIMIT %s,  13')
    startPoint = 12 * int(page)
    totalAttractions = getData(searchByPageAndNameKeyword, ('%' + keyword + '%', startPoint,), 'all')

    if len(totalAttractions) == 13:
        isNextPage = True

    return isNextPage, totalAttractions


def getAttractionById(id):
    searchById = ('SELECT id, name, category, description, address, transport, mrt, latitude, '
                  'longitude, images FROM taipeitrip WHERE id = %s')
    result = getData(searchById, (id,))

    return result
