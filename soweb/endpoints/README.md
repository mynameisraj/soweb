# Endpoints

All the endpoints

## /auth
    * POST: {"username": username, "password": password}
        * success: {"sessionToken": "your session token for this user"}
        * failure: {"error": "some kind of error message"}

## /join
    * POST: {"username": username, "password": password, "email": "email address"}
        * email is optional
        * success: {"sessionToken": "your session token for this user"}
        * failure: {"error": "some kind of error message"}

For the following endpoints, a sessionToken is required

## /find
    * POST : {"lat": lat, "lon": lon, "sessionToken": sessionToken, "limit": limit}
        * limit is optional
        * success: list of user entries
        * failure: {"error": "some kind of error message"}

## /update/location
    * PUT: {"sessionToken": sessionToken, "lat": lat, "lon": lon}
        * success:  {"success": "success message"}
        * failure: {"error": "some kind of error message"}

## /update/status
    * PUT: {"sessionToken": sessionToken, "status": status}
        * success:  {"success": "success message"}
        * failure: {"error": "some kind of error message"}

## /update/online
    * PUT: {"sessionToken": sessionToken, "onlineStatus": bool}
        * onlineStatus must be a boolean value
        * success:  {"success": "success message"}
        * failure: {"error": "some kind of error message"}
        
## /profile_pic
    * POST: {"sessionToken": sessionToken, "username": username}
        * success: {"url": url to the profile picture}
        * failure: {"error": "some kind of error message"}
