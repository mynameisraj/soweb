import requests, json
from flask_restful import reqparse, Resource
from real_config import url
from common import updateUser, apiHeader, validateSessionToken, whoAmI, getUserObjectId

class UserStatus(Resource):
    def extractUsernames(self, status):
        things = status.split(" ")
        startsWithAt = filter(lambda x: x[0] == "@", things)
        tempObjectIds = [getUserObjectId(username[1:]) for username in startsWithAt] #get all the user object ids
        userObjectIds = filter(lambda x: x != None, tempObjectIds) #remove invalid ones
        return userObjectIds

    def handleMessage(self, sessionToken, status):

        mentionIds = self.extractUsernames(status)

        if mentionIds == []:
            #this isn't a message
            return

        #get our object id
        myObjectId = whoAmI(sessionToken)
        entry = {
                    "from" : {
                            "__type":"Pointer",
                            "className":"_User",
                            "objectId": myObjectId
                          },
                    "message" : status,
                    "read" : False,
                    "to" : {
                            "__type":"Pointer",
                            "className":"_User",
                            "objectId": myObjectId
                          }
                }
        for toObjectId in mentionIds:
            #set the recipient
            entry["to"]["objectId"] = toObjectId
            #post them into the system
            headers = apiHeader()
            r = requests.post(url + "/classes/Messages", headers = headers,
                    json = entry)



    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument("sessionToken", required=True)
        parser.add_argument("status", required=True)
        args = parser.parse_args()

        if not validateSessionToken(args["sessionToken"]):
            return {"error": "authentication problem"}

        self.handleMessage(args["sessionToken"], args["status"])

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
        default_pic = "/default_profile_pic.jpg"

        if "error" in userEntry:
            return {"error": "problem finding user"}

        if "picURL" in userEntry:
            return {"url": userEntry["picURL"]}
        elif "profileImage" in userEntry:
            return {"url": userEntry["profileImage"]["image"]["url"]}
        else:
            return {"url": default_pic}
