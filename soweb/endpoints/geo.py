import requests, json
from flask_restful import reqparse, abort, Resource
from real_config import app_id, api_key, url

from common import whoAmI, sessionTokenHeader 

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
        sessionToken = args["sessionToken"]

        userObjectId = whoAmI(sessionToken)
        headers = sessionTokenHeader(sessionToken)

        if userObjectId == None:
            #something is wrong with this session token
            #most likely expired or a permissions problem
            return {"error": "unable to update location"}

        r = requests.put(url + "/users/" + userObjectId, headers = headers, json = data)
        response = json.loads(r.text)
        if "error" in response:
            return {"error": "unable to update location"}
        return {"message": "successfully updated location"}



