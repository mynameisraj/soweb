import requests
from flask_restful import reqparse, Resource
from common import updateUser

class UserStatus(Resource):
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument("sessionToken", required=True)
        parser.add_argument("status", required=True)
        args = parser.parse_args()

        data = {"status": args["status"]}
        return updateUser(args["sessionToken"], data)

class UserOnlineStatus(Resource):
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument("sessionToken", required=True)
        parser.add_argument("onlineStatus", required=True, type=bool)
        args = parser.parse_args()

        data = {"online": args["onlineStatus"]}
        return updateUser(args["sessionToken"], data)
