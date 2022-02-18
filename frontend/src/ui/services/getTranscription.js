import API from "./api";
import ENDPOINTS from "./apiendpoints";
import CONFIG from "./config";

export default class FetchTranscription extends API {
  constructor(
    source = "en",
    audioContent = "",
    modelID = "",
    setModel = '',
    timeout = 200000
  ) {
    super("POST", timeout, false);
    this.fetch_model = null;
    this.modelID = modelID;
    this.setModel = setModel;
    this.audioContent = audioContent;
    this.source = source;
    if (this.setModel === 'vakyansh') {
      this.endpoint = `${CONFIG.BASE_URL_5000}${ENDPOINTS.get_transcription}`;
    } else if (this.setModel === 'indic-asr') {
      this.endpoint = `${CONFIG.BASE_URL_INDIC}`;
    } else if (this.setModel === 'ola-asr') {
      this.endpoint = `${CONFIG.BASE_URL_OLA}`;
    }
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
