import API from "./api";
// import C from "../../constants";
import ENDPOINTS from "./apiendpoints";

export default class FetchSentence extends API {
  constructor(timeout = 200000) {
    super("GET", timeout, false);
    this.type = 'FETCH_SENTENCE';
    this.fetch_sentence = null;
    this.endpoint = `${super.apiEndPoint()}${ENDPOINTS.fetchsentence}`;
  }

  toString() {
    return `${super.toString()} email: ${this.email} token: ${this.token} expires: ${this.expires} userid: ${this.userid}, type: ${this.type}`;
  }

  processResponse(res) {
    super.processResponse(res);
    this.fetch_sentence = res.data;
  }

  apiEndPoint() {
    return this.endpoint;
  }

  getBody() {
    return {};
  }

  getHeaders() {
    return {
      headers: {
        "Content-Type": "application/json",
         'auth-token': `${decodeURI(localStorage.getItem("token"))}`
      }
    };
  }

  getPayload() {
    return this.fetch_sentence;
  }
}
