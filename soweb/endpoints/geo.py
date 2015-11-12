import requests, json
from flask_restful import reqparse, Resource
from real_config import url

from common import updateUser, validateSessionToken, apiHeader


"""
Code for updating and querying geo points
"""

class UpdateLocation(Resource):
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument("sessionToken", required=True)
        parser.add_argument("lat", required=True)
        parser.add_argument("lon", required=True)

        args = parser.parse_args()
        data = {"geo": {"__type": "GeoPoint",
                             "latitude": float(args["lat"]),
                             "longitude": float(args["lon"])
                            }}
        return updateUser(args["sessionToken"], data)

class GeoQuery(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("sessionToken", required=True)
        parser.add_argument("lat", required=True)
        parser.add_argument("lon", required=True)
        parser.add_argument("limit")

        args = parser.parse_args()
        sessionToken = args["sessionToken"]
        #we're going to verify this session token for security purposes
        if not validateSessionToken(args["sessionToken"]):
            return {"error": "authentication problem"}


        limit = 10 #default is 10
        if args["limit"] != None:
            limit = int(args["limit"])

        loc = {"geo": {
                    "$nearSphere": {
                        "__type": "GeoPoint",
                        "latitude": float(args["lat"]),
                        "longitude": float(args["lon"])
                        }
                    }
              }


        data = {"limit": limit,
                "where":json.dumps(loc)}
        header = apiHeader()
        r = requests.get(url + "/users", headers = header, params = data)
        response = json.loads(r.text)
        #WARNING: this returns ALL user information including things like email
        return response
