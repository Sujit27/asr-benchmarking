import API from "./api";
import ENDPOINTS from "./apiendpoints";
import CONFIG from "./config";

export default class FetchModel extends API {
  constructor(
    source = "en",
    audioContent = "",
    modelID = "",
    timeout = 200000
  ) {
    super("POST", timeout, false);
    this.fetch_model = null;
    this.modelID = modelID;
    this.audioContent = audioContent;
    this.source = source;
    this.endpoint = `${CONFIG.BASE_URL_5000}${ENDPOINTS.get_transcription}`;
  }

  toString() {
    return `${super.toString()} email: ${this.email} token: ${
      this.token
    } expires: ${this.expires} userid: ${this.userid}, type: ${this.type}`;
  }

  processResponse(res) {
    super.processResponse(res);
    this.fetch_model = res;
  }

  apiEndPoint() {
    return this.endpoint;
  }

  getBody() {
    return {
      source: this.source,
      audioContent: this.audioContent,
      modelId: this.modelID,
    };
  }

  getHeaders() {
    return {
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  getPayload() {
    return this.fetch_model;
  }
}
