import requests, json
from real_config import app_id, api_key, url
"""
Common functions that will be useful for
other parts of the code
"""

def sessionTokenHeader(sessionToken):
    return {"X-Parse-Application-Id": app_id,
            "X-Parse-REST-API-Key": api_key,
            "X-Parse-Session-Token": sessionToken}

def whoAmI(sessionToken):
    #returns object id for the user who owns this session
    headers = sessionTokenHeader(sessionToken)
    r = requests.get(url + "/users/me", headers = headers)
    response = json.loads(r.text)
    if "objectId" in response:
        return response["objectId"]
    return None
