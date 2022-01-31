from flask import Flask, json, request
import get_random_text


app = Flask(__name__)
#CORS(app)

@app.route('/generate_random_text',methods=['POST'])
def generate_text():

    body = request.get_json()
    file_name= "../../text_corpus/example.json"
    language = body["language"]
    result =get_random_text.get_text(file_name,language)
    if(result):
        final_result ={ "generated_text": result }
        return json.dumps(final_result)
    else:
        return json.dumps({"generated_text":" generate_random_text got some error "})


if __name__ == '__main__':
    app.run(host = "0.0.0.0", port=5001, debug=True)
