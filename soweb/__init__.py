import os
from flask import Flask, send_from_directory, render_template
from flask_restful import Api

#normal boilerplate
app = Flask(__name__)
app.config.from_object('config')
api = Api(app)

#basic routes
@app.route("/favicon.ico")
def favicon():
    return send_from_directory(
            os.path.join(app.root_path, 'static/img'),'favicon.ico')

@app.route("/default_profile_pic.jpg")
def default_profile_pic():
    return send_from_directory(
            os.path.join(app.root_path, 'static/img'),'anon.jpg')

@app.route("/")
def index():
    return render_template("index.html")

#rest endpoints
from endpoints.auth import Auth
api.add_resource(Auth, "/auth")

from endpoints.auth import CreateUser
api.add_resource(CreateUser, "/join")

from endpoints.geo import UpdateLocation
api.add_resource(UpdateLocation, "/update/location")

from endpoints.geo import GeoQuery
api.add_resource(GeoQuery, "/find")

from endpoints.user import UserStatus
api.add_resource(UserStatus, "/update/status")

from endpoints.user import UserOnlineStatus
api.add_resource(UserOnlineStatus, "/update/online")

from endpoints.user import UserProfilePicture
api.add_resource(UserProfilePicture, "/profile_pic")

from endpoints.user import  MyMessages
api.add_resource(MyMessages, "/msgs")
