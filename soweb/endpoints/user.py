import requests, json
from flask_restful import reqparse, Resource
from real_config import url
from common import updateUser, apiHeader, validateSessionToken

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

class UserProfilePicture(Resource):
    def getEntryForUsername(self, username):
        header = apiHeader()
        query = {"username": username}
        data = {"where": json.dumps(query), "include": "profileImage"}

        r = requests.get(url + "/users", headers = header, params = data)
        response = json.loads(r.text)
        if response["results"] == []:
            return {"error": "user not found"}
        return response["results"][0]

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("sessionToken", required=True)
        parser.add_argument("username", required=True)
        args = parser.parse_args()

        if not validateSessionToken(args["sessionToken"]):
            return {"error": "authentication problem"}

        userEntry = self.getEntryForUsername(args["username"])
        default_pic = "http://files.parsetfss.com/c5fd1990-98a1-4d6d-8bd8-d66e4c413d88/tfss-b0fe026f-5f32-4e36-8688-31df088fe36f-Random-profiles-72.png"
        #must change this later

        if "error" in userEntry:
            return {"error": "problem finding user"}

        if "picURL" in userEntry:
            return {"url": userEntry["picURL"]}
        elif "profileImage" in userEntry:
            return {"url": userEntry["profileImage"]["image"]["url"]}
        else:
            return {"url": default_pic}