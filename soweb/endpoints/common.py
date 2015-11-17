import requests, json
from real_config import app_id, api_key, url
"""
Common functions that will be useful for
other parts of the code
"""

def apiHeader():
    return {"X-Parse-Application-Id": app_id,
            "X-Parse-REST-API-Key": api_key}

def sessionTokenHeader(sessionToken):
    header = apiHeader()
    header["X-Parse-Session-Token"] = sessionToken
    return header

def whoAmI(sessionToken):
    #returns object id for the user who owns this session
    headers = sessionTokenHeader(sessionToken)
    r = requests.get(url + "/users/me", headers = headers)
    response = json.loads(r.text)
    if "objectId" in response:
        return response["objectId"]
    return None

def validateSessionToken(sessionToken):
    return whoAmI(sessionToken) != None

def updateUser(sessionToken, data):
    headers = sessionTokenHeader(sessionToken)

    userObjectId = whoAmI(sessionToken)
    if userObjectId == None:
        #we don't use validateSessionToken
        #to avoid a duplicated call
        return {"error": "authentication error"}

    r = requests.put(url + "/users/" + userObjectId,
            headers = headers, json = data)
    response = json.loads(r.text)

    if "error" in response:
        return {"error": "update failure"}
    return {"success": "update success"}

def getUserObjectId(username):
    query = {"username":username}
    data = {"where":json.dumps(query)}
    header = apiHeader()
    r = requests.get(url + "/users", headers = header, params = data)
    response = json.loads(r.text)
    if response["results"] == []:
        return None
    else:
        return response["results"][0]["objectId"]
