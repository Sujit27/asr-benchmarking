from flask_pymongo import PyMongo
from pymongo.errors import BulkWriteError
from flask import Flask, json, request
from bson import json_util
import get_random_text
import flask
import config




app = flask.Flask(__name__)
uri_=config.MONGO_DB_SERVER_ADDRESS+config.db_name
mongodb_client = PyMongo(app, uri=uri_) 
db = mongodb_client.db


@app.route('/get_sentence',methods = ['POST'])
def get_sentence():

    body = request.get_json()
    file_name = config.json_file_for_get_random_text
    language = body["language"]
    result = get_random_text.get_text(file_name,language)
    if(result):
        final_result = { "generated_text": result }
        return json.dumps(final_result)
    else:
        return json.dumps({"generated_text":" generate_random_text got some error "})



@app.route("/submit_feedback",methods = ['POST'])
def submit_feedback():
    body = request.get_json()
    record = { "feedbackScore": body["feedbackScore"] , "sessionID" :body["sessionID"] ,"modelID" : body["modelID"] }
    db.feedback_collection.insert_one(record) # here feedback_collection  is the collection name which is located inside  specified  database 
    dict_={}
    dict_['message']='******************Thank You ******************'
    dict_['data']=record
    return flask.jsonify(json.loads(json_util.dumps(dict_)))

@app.route("/show_all_feedbacks",methods=['GET'])
def show_all_feedbacks():
    all_records = db.feedback_collection.find()   # here feedback_collection is the collection name which is located inside  specified  database 

    return flask.jsonify(json.loads(json_util.dumps(all_records)))
    #return flask.jsonify([todo for todo in todos])



@app.route("/export_results",methods=['POST'])
def export_results():
    body = request.get_json()
    record = { "feedbackScore": body["feedbackScore"] , "sessionID" :body["sessionID"] ,"modelID" : body["modelID"] ,"audioUri":body["audioUri"],"predictedText":body["predictedText"],"inputText":body["inputText"],"wer":body["wer"],"cer":body["cer"]}
    db.save_model_predictions.insert_one(record) # here save model predictions is the collection name which is located inside  specified  database 
    dict_={}
    dict_['message']='*************Success**********************'
    dict_['data']=record
    return flask.jsonify(json.loads(json_util.dumps(dict_)))

@app.route("/show_all_exported_results",methods=['GET'])
def show_all_exported_results():
    all_records = db.save_model_predictions.find()  # here save model predictions is the collection name which is located inside  specified  database 

    return flask.jsonify(json.loads(json_util.dumps(all_records)))
    #return flask.jsonify([todo for todo in todos])


@app.route("/get_model_ids",methods=['POST'])
def get_model_ids():

    body = request.get_json()
    language = body["language"]
    model_ids=[]

    with open(config.FETCH_MODEL_CONFG) as f:
        confs = json.load(f)
    for model in confs['models']:
        if model['language_code']==language:
            model_ids.append(model['model_id'])
        
    return flask.jsonify({"model_ids":model_ids})





if __name__ == '__main__':
    app.run(host =config.HOST, port=config.PORT, debug=True)
