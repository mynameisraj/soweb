import os
from flask import Flask, send_from_directory, render_template

#normal boilerplate
app = Flask(__name__)
app.config.from_object('config')

#register modules here
#example:
#from app.users.views import mod as usersModule
#app.register_blueprint(usersModule)

@app.route("/favicon.ico")
def favicon():
    return send_from_directory(
            os.path.join(app.root_path, 'static/img'),'favicon.ico')

@app.route("/")
def index():
    return render_template("index.html")

@app.before_request
def log_entry():
    app.logger.debug("Handling request")


@app.teardown_request
def log_exit(exc):
    app.logger.debug("Finished handling request", exc_info=exc)
