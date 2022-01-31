from flask_pymongo import PyMongo
from pymongo.errors import BulkWriteError
from flask import  request , json
from bson import json_util

import flask

#database name
db_name="testing"

app = flask.Flask(__name__)
uri_="mongodb://localhost:27017/"+db_name
mongodb_client = PyMongo(app, uri=uri_) 
db = mongodb_client.db


@app.route("/add_one",methods=['POST'])
def add_one():
    body = request.get_json()
    record = { "feedbackScore": body["feedbackScore"] , "sessionID" :body["sessionID"] ,"modelID" : body["modelID"] }
    db.example_collection.insert_one(record) # here example_collection is the collection name which is located inside  specified  database 
    dict_={}
    dict_['message']='Success'
    dict_['data']=record
    return flask.jsonify(json.loads(json_util.dumps(dict_)))

@app.route("/show_all_records",methods=['GET'])
def home():
    all_records = db.example_collection.find()

    return flask.jsonify(json.loads(json_util.dumps(all_records)))
    #return flask.jsonify([todo for todo in todos])

if __name__ == '__main__':
    app.run(host = "0.0.0.0", port=5001, debug=True)
