import API from "./api";
// import C from "../../constants";
import ENDPOINTS from "./apiendpoints";

export default class FetchModel extends API {
  constructor(language = 'en', type = 'model', timeout = 200000) {
    super("POST", timeout, false);
    // this.type = 'FETCH_MODEL';
    this.fetch_model = null;
    this.lang = language;
    this.endpoint = type === 'model' ? `${super.apiEndPoint()}${ENDPOINTS.fetchmodel}` : `${super.apiEndPoint()}${ENDPOINTS.fetchsentence}` ;
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
        language : this.lang
    };
  }

  getHeaders() {
    return {
      headers: {
        "Content-Type": "application/json",
        //  'auth-token': `${decodeURI(localStorage.getItem("token"))}`
      }
    };
  }

  getPayload() {
    return this.fetch_model;
  }
}
