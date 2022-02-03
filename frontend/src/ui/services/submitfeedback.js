import API from "./api";
import ENDPOINTS from "./apiendpoints";

export default class SubmitFeedback extends API {
  constructor(value, sessionID, modelID, timeout = 200000) {
    super("POST", timeout, false);
    this.score = value;
    this.sessionId = sessionID;
    this.modelId = modelID;
    this.fetch_model = null;
    this.endpoint = `${super.apiEndPoint()}${ENDPOINTS.submitfeedback}`;
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
        feedbackScore: this.score,
        sessionID: this.sessionId,
        modelID: this.modelId,
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
