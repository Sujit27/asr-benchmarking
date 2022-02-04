import API from "./api";
import ENDPOINTS from "./apiendpoints";

export default class WerCerScore extends API {
  constructor(ptext, ttext, type = 'wer', timeout = 200000) {
    super("POST", timeout, false);
    this.ptext = ptext;
    this.ttext = ttext;
    this.fetch_model = null;
    this.endpoint = type === 'wer' ? `${super.apiEndPoint()}${ENDPOINTS.get_wer_score}` : `${super.apiEndPoint()}${ENDPOINTS.get_cer_score}` ;
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
        predicted_text:this.ptext,
        true_text: this.ttext,
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
