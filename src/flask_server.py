from flask_pymongo import PyMongo
from pymongo.errors import BulkWriteError
from flask import Flask, json, request , redirect ,url_for ,send_file
from bson import json_util
import get_random_text
import flask
import config
from flask_cors import CORS, cross_origin
import get_scores
import requests
import json
import threading
import pandas as pd
from io import BytesIO
import time

app = flask.Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

uri_=config.MONGO_DB_SERVER_ADDRESS+config.db_name
mongodb_client = PyMongo(app, uri=uri_) 
db = mongodb_client.db

def get_transcription_and_store(API_ENDPOINT1,data1,headers_,body,modelName,model_id):
    r1 = requests.post(API_ENDPOINT1, data = json.dumps(data1),verify = False ,headers = headers_)
    print(r1)
    result1 = r1.json()['transcript']
    print(f"*****************{modelName}  prediction ************")
    print(result1)
    
    cer_score = get_scores.get_cer( result1,body["inputText"])
    wer_score = get_scores.get_wer( result1,body["inputText"])
    record = { "language": body["language"] , "sessionID" :body["sessionID"] ,"model_name":modelName,"modelID" : model_id,"predictedText":result1,"inputText":body["inputText"],"wer": wer_score , "cer" : cer_score}
    db.save_model_predictions.insert_one(record)
    return f"{modelName} transcription completed "


def get_all_model_predictions(body):

    lang = body["language"]
    base_64 = body["audioContent"]
    modelID = body["modelID"]

    API_ENDPOINT = "http://localhost:5001/get_model_ids"
    data = { "language":lang }
    headers_ = {
        'Content-Type': "application/json",
        'Authorization': "Bearer token",
        'cache-control': "no-cache"
        }
    
    r = requests.post(API_ENDPOINT, data = json.dumps(data),verify=False ,headers=headers_)
    print(r)
    result = r.json()
    lang_supported_models = []
    lang_modelIds = []
    for k  in range(len(result['model_info'])):
        if result['model_info'][k]['model_id'] != modelID:
            lang_supported_models.append(result['model_info'][k]['model_name'])
            lang_modelIds.append(result['model_info'][k]['model_id'])
    print(lang_supported_models)
    print(lang_modelIds)


    for model_ in range(len(lang_supported_models)):
        if lang_supported_models[model_] == 'vakyansh' and (lang_modelIds[model_]  != modelID) :
            API_ENDPOINT1 = "http://localhost:5000/get_transcription"
        elif lang_supported_models[model_]== 'indic-asr' and (lang_modelIds[model_] != modelID):
            API_ENDPOINT1 = "http://localhost:8080/infer_indic_speech"
        elif lang_supported_models[model_]== 'ola-asr' and (lang_modelIds[model_] != modelID):
            API_ENDPOINT1 = "http://localhost:8081/decode"
        else:
            continue


        data1 = {
        "source":lang,
        "audioContent":base_64
        }
        try:

            response =get_transcription_and_store(API_ENDPOINT1,data1,headers_,body,lang_supported_models[model_],lang_modelIds[model_])
            print(response)
        except:
            print(f'some problem with {lang_supported_models[model_]} model ')
        # model_thread = threading.Thread(target=get_transcription_and_store , args = (API_ENDPOINT1,data1,headers_,body,lang_supported_models[model_],lang_modelIds[model_]))
        # model_thread.start()
        # time.sleep(3)

@app.route('/get_sentence',methods = ['POST'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
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
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def submit_feedback():
    body = request.get_json()
    record = { "feedbackScore": body["feedbackScore"] , "sessionID" :body["sessionID"] ,"modelID" : body["modelID"] }
    db.feedback_collection.insert_one(record) # here feedback_collection  is the collection name which is located inside  specified  database 
    dict_={}
    dict_['message']='******************Thank You ******************'
    dict_['data']=record
    return flask.jsonify(json.loads(json_util.dumps(dict_)))

@app.route("/show_all_feedbacks",methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def show_all_feedbacks():
    all_records = db.feedback_collection.find()   # here feedback_collection is the collection name which is located inside  specified  database 
    csv_file = pd.DataFrame(all_records)
    response_stream = BytesIO(csv_file.to_csv().encode())
    return send_file(response_stream , mimetype="text/csv", attachment_filename="feedbacks.csv")
    #return flask.jsonify(json.loads(json_util.dumps(all_records)))
    #return flask.jsonify([todo for todo in todos])


@app.route("/export_results",methods=['POST'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def export_results():
    body = request.get_json()
    record = { "language": body["language"] , "sessionID" :body["sessionID"] ,"model_name":body["model_name"],"modelID" : body["modelID"] ,"predictedText":body["predictedText"],"inputText":body["inputText"],"wer":body["wer"],"cer":body["cer"]}
    db.save_model_predictions.insert_one(record) ## here save model predictions is the collection name which is located inside  specified  database 
    content={ "sessionID" :body["sessionID"] , "audioContent":body["audioContent"]}
    db.audio_content.insert_one(content) 
    model_thread = threading.Thread(target=get_all_model_predictions , args = (body,))
    model_thread.start()
    print('after all model prediction function ...')
    dict_={}
    dict_['message']='*************Success**********************'
    dict_['data']=record
    return flask.jsonify(json.loads(json_util.dumps(dict_)))

    
@app.route("/show_all_exported_results",methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def show_all_exported_results():
    all_records = db.save_model_predictions.find()  # here save model predictions is the collection name which is located inside  specified  database 
    csv_file = pd.DataFrame(all_records)
    response_stream = BytesIO(csv_file.to_csv().encode())
    return send_file(response_stream , mimetype="text/csv", attachment_filename="exported_results.csv")

    #return flask.jsonify(json.loads(json_util.dumps(all_records)))
    #return flask.jsonify([todo for todo in todos])

@app.route("/show_all_audioContent",methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def show_all_audioContent():
    all_records = db.audio_content.find()  # here save model predictions is the collection name which is located inside  specified  database 
    csv_file = pd.DataFrame(all_records)
    response_stream = BytesIO(csv_file.to_csv().encode())
    return send_file(response_stream , mimetype="text/csv", attachment_filename="audio_content.csv")

@app.route("/get_model_ids",methods=['POST'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def get_model_ids():

    body = request.get_json()
    language = body["language"]
    model_ids=[]

    with open(config.FETCH_MODEL_CONFG) as f:
        confs = json.load(f)
    for model in confs['models']:
        if model['language_code']==language:
            model_ids.append({"model_id" : model['model_id'] , "model_name" : model["model_type"]})
        
    return flask.jsonify({"model_info":model_ids})


@app.route("/get_cer_score",methods=['POST'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def get_cer_score():

    body = request.get_json()
    predicted = body["predicted_text"]
    reference = body["true_text"]
    score=get_scores.get_cer(predicted ,reference )

    return flask.jsonify({"cer_score":score})


@app.route("/get_wer_score",methods=['POST'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def get_wer_score():

    body = request.get_json()
    predicted = body["predicted_text"]
    reference = body["true_text"]
    score=get_scores.get_wer(predicted ,reference )

    return flask.jsonify({"wer_score":score})

if __name__ == '__main__':
    app.run(host =config.HOST, port=config.PORT, debug=False)
