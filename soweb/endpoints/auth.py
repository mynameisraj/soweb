import requests, json
from flask_restful import reqparse, abort, Resource
from real_config import app_id, api_key, url

class Auth(Resource):
    def post(self):
        """
        they post us username/password
        we send that to parse
        return the sessiontoken
        """
        parser = reqparse.RequestParser()
        parser.add_argument("username", required=True)
        parser.add_argument("password", required=True)
        args = parser.parse_args()
        #extract require username/password

        headers = {"X-Parse-Application-Id": app_id,
                   "X-Parse-REST-API-Key": api_key,
                   "X-Parse-Revocable-Session": 1}
        params = {"username": args["username"],
                   "password": args["password"]}
        r = requests.get(url + "/login", headers = headers, params = params)
        #setup to send it the way parse wants

        response = json.loads(r.text)
        if "error" in response:
            return {"error": "unable to authenticate"}

        return {"sessionToken": response["sessionToken"]}

class CreateUser(Resource):
    def post(self):
        """
        they post us username/password
        we send that to parse
        which creates the user and gives us a session token
        return the sessiontoken
        """
        parser = reqparse.RequestParser()
        parser.add_argument("username", required=True)
        parser.add_argument("password", required=True)
        parser.add_argument("email")
        args = parser.parse_args()
        #extract require username/password

        #todo: add stuff for the geo location of the person, and display name
        headers = {"X-Parse-Application-Id": app_id,
                   "X-Parse-REST-API-Key": api_key,
                   "X-Parse-Revocable-Session": 1}
        payload = {"username": args["username"],
                   "password": args["password"],
                   "displayName": args["username"]
                   }

        if args["email"] != None:
            payload["email"] = args["email"]
            #email is optional

        r = requests.post(url + "/users", headers = headers, json = payload)
        #setup to send it the way parse wants

        response = json.loads(r.text)
        if "error" in response:
            return {"error": "unable to create user"}

        return {"sessionToken": response["sessionToken"]}
