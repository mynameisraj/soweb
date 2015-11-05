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

@app.route("/")
def index():
    return render_template("index.html")

#rest endpoints
from endpoints.example import Example
api.add_resource(Example, "/example")

from endpoints.auth import Auth
api.add_resource(Auth, "/auth")
