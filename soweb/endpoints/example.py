from flask_restful import reqparse, abort, Resource

parser = reqparse.RequestParser()
class Example(Resource):
    def get(self):
        return {"message": "hello"}
