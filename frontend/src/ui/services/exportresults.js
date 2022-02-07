import API from "./api";
import ENDPOINTS from "./apiendpoints";

export default class ExportResults extends API {
  constructor(value, sessionID, modelID, audioUri, predictedText, inputText, wer, cer, timeout = 200000) {
    super("POST", timeout, false);
    this.language = value;
    this.sessionId = sessionID;
    this.modelId = modelID;
    this.audioUrl = audioUri;
    this.predictedText = predictedText;
    this.inputText = inputText;
    this.wer = wer;
    this.cer = cer;
    this.fetch_model = null;
    this.endpoint = `${super.apiEndPoint()}${ENDPOINTS.export_results}`;
  }

  toString() {
    return `${super.toString()} email: ${this.email} token: ${this.token} expires: ${this.expires} userid: ${this.userid}, type: ${this.type}`;
  }

  processResponse(res) {
    super.processResponse(res);
    this.fetch_model = res.data;
  }

  apiEndPoint() {
    return this.endpoint;
  }

  getBody() {
    return {
        language: this.language,
        sessionID: this.sessionId,
        modelID: this.modelId,
        audioUri: this.audioUrl,
        predictedText: this.predictedText,
        inputText: this.inputText,
        wer: this.wer,
        cer: this.cer,
    };
  }

  getHeaders() {
    return {
      headers: {
        "Content-Type": "application/json",
      }
    };
  }

  getPayload() {
    return this.fetch_model;
  }
}
