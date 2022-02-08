import * as React from "react";
import { v1 as uuidv1 } from "uuid";
import { Component } from "react";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import { Typography } from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import Button from "@material-ui/core/Button";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import startAudio from "../../assets/start.svg";
import stopAudio from "../../assets/stop.svg";
import FetchModel from "../services/fetchModel";
import FetchSentence from "../services/fecthSentence";
import SubmitFeedback from "../services/submitfeedback";
import ExportResults from "../services/exportresults";
import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import GetTranscription from "../services/getTranscription";
import CircularProgress from "./ProgressBar";
import WerCerScore  from "../services/werCerScore";

const languages = [
  {
    value: "en",
    label: "English",
  },
  {
    value: "kn",
    label: "Kannada",
  },
  {
    value: "hi",
    label: "Hindi",
  },
];
const models = [
    {
        value: '1',
        label: 'Vakyansh',
    }
]
class Mainform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: "en",
      rating: 0,
      micOn: true,
      setModel: "1",
      modelID: "",
      setSentence: "",
      sessionID: uuidv1(),
      audioUri: "",
      predictedText: "",
      wer: "",
      cer: "",
      recordAudio: "",
      base: "",
      loading: false,
      show: false,
    };
  }

  clearState = () => {
    this.setState(
      {
        lang: "en",
        rating: 0,
        micOn: true,
        setModel: "",
        modelID: "",
        setSentence: "",
        sessionID: uuidv1(),
        audioUri: "",
        predictedText: "",
        wer: "",
        cer: "",
        recordAudio: "",
        base: "",
        show: false,
        loading: false,
      },
      () => {
        this.getModel("en", "model");
        this.getSentence();
      }
    );
  };

  // for language selection
  handleChange = (event) => {
    this.setState({
      lang: event.target.value,
      audioUri: "",
      base: "",
      recordAudio: "",
      predictedText: "",
      modelID: "",
      rating: 0,
      setModel: "",
    });
    this.getModel(event.target.value, "model");
    // this.getModel(event.target.value, "sentence");
  };

  // for model selection
  handleModelChange = (event) => {
    this.setState({
      setModel: event.target.value,
      rating: 0,
    });
    this.getSentence();
  };

  componentDidMount() {
    this.setState({ loading: true });
    this.getModel("en", "model");
    this.getSentence();
    // this.getModel("en", "sentence");
  }

  getModel = (lan, type) => {
    const apiObj = new FetchModel(lan, type);
    fetch(apiObj.apiEndPoint(), {
      method: "POST",
      headers: apiObj.getHeaders().headers,
      body: JSON.stringify(apiObj.getBody()),
    })
      .then(async (res) => {
        const resData = await res.json();
        if (type === "model") {
          this.setState({ setModel: resData.model_ids[0], modelID: resData.model_ids[0], loading: false, setSentence: '' });
        } else {
          this.setState({
            setSentence: resData.generated_text,
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  getSentence = () => {
    const apiObj = new FetchSentence(this.state.lang);
    fetch(apiObj.apiEndPoint(), {
      method: "POST",
      headers: apiObj.getHeaders().headers,
      body: JSON.stringify(apiObj.getBody()),
    })
      .then(async (res) => {
        const resData = await res.json();
        // console.log("resData ======", resData);
        this.setState({
            rating: 0,
            setSentence: resData.generated_text,
            loading: false,
            sessionID: uuidv1(),
            audioUri: '',
            predictedText: '',
        });
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  // for feedback ratings
  handleRating = (event) => {
    this.setState({ rating: event.target.value });
    // this.updateFeedback(
    //   event.target.value,
    //   this.state.sessionID,
    //   this.state.modelID
    // );
  };

  updateFeedback = () => {
    const apiObj = new SubmitFeedback(this.state.rating, this.state.sessionID, this.state.modelID);
    fetch(apiObj.apiEndPoint(), {
      method: "POST",
      headers: apiObj.getHeaders().headers,
      body: JSON.stringify(apiObj.getBody()),
    })
      .then(async (res) => {
        const resData = await res.json();
        console.log('resData', resData)
        this.clearState();
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  // on form submit
  //   handleSubmit = (event) => {
  //     console.log("form submit", event.target.value);
  //     this.submitForm(event.target.value);
  //   };

  getWerScrore = async () => {
    const obj = new WerCerScore(this.state.predictedText, this.state.setSentence, 'wer');
    const fetchObj = await fetch(obj.apiEndPoint(), {
      method: "post",
      headers: obj.getHeaders().headers,
      body: JSON.stringify(obj.getBody()),
    });
    if (fetchObj.ok) {
      const result = await fetchObj.json();
      this.setState({ loading: true, wer: result.wer_score });
      this.getCerScrore()
    }
  }

  getCerScrore = async () => {
    const obj = new WerCerScore(this.state.predictedText, this.state.setSentence, 'cer');
    const fetchObj = await fetch(obj.apiEndPoint(), {
      method: "post",
      headers: obj.getHeaders().headers,
      body: JSON.stringify(obj.getBody()),
    });
    if (fetchObj.ok) {
      const result = await fetchObj.json();
      this.setState({ loading: true, cer: result.cer_score });
      this.submitForm()
    }
  }

  submitForm = () => {
    const apiObj = new ExportResults(
      this.state.lang,
      this.state.sessionID,
      this.state.modelID,
      this.state.audioUri,
      this.state.predictedText,
      this.state.setSentence,
      this.state.wer,
      this.state.cer
    );
    fetch(apiObj.apiEndPoint(), {
      method: "POST",
      headers: apiObj.getHeaders().headers,
      body: JSON.stringify(apiObj.getBody()),
    })
      .then(async (res) => {
        const resData = await res.json();
        console.log('resData', resData)
        this.setState({ loading: false });
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  blobToBase64 = (blob) => {
    let reader = new FileReader();
    reader.readAsDataURL(blob.blob);
    reader.onloadend = () => {
      let base64data = reader.result;
      this.getTranscriptionAPICall(base64data.split("base64,")[1]);
      this.setState({ base: base64data });
    };
  };

  getTranscriptionAPICall = async (base) => {
    const { modelID, lang } = this.state;
    const obj = new GetTranscription(lang, base, modelID);
    const fetchObj = await fetch(obj.apiEndPoint(), {
      method: "post",
      headers: obj.getHeaders().headers,
      body: JSON.stringify(obj.getBody()),
    });
    if (fetchObj.ok) {
      const result = await fetchObj.json();
      this.setState({ predictedText: result.transcript, loading: true, show: true });
      this.getWerScrore()
    }
  };

  onStopRecording = (data) => {
    this.setState({ audioUri: data.url, base: this.blobToBase64(data, this) });
  };

  onMicClick = () => {
    if (this.state.setSentence) {
      this.setState({
        micOn: false,
        recordAudio: RecordState.START,
        audioUri: "",
        predictedText: "",
      });
    }
  };
  onStopClick = () => {
    this.setState({
      micOn: true,
      recordAudio: RecordState.STOP,
      loading: true,
    });
  };

  render() {
    return (
        <div>
        {this.state.loading ? (
          <CircularProgress token={true} val={1000} eta={2000 * 1000} />
        ) : (
          <></>
        )}
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "2px solid #999",
            padding: "2% 0", borderRadius: '6px',
            margin: "3% auto", width: '60%',
            "& .MuiTextField-root": { m: 1, width: "25ch" },
          }}
          noValidate
          autoComplete="off"
        >
            <Typography value="" variant="h4">
                Speech Model Recognition
            </Typography>

            <div style={{
                marginTop: "4%",
                marginBottom: "1%",
                display: "flex",
                width: "34rem",
                alignItems: "center",
                justifyContent: "center",
                }}
            >
                <TextField
                id="outlined-select-currency"
                select
                style={{ width: "22ch", marginRight: "22%", fontSize:'1.2em' }}
                value={this.state.lang}
                label="Select Language"
                onChange={this.handleChange}
                >
                {languages.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                    {option.label}
                    </MenuItem>
                ))}
                </TextField>

                <TextField
                id="outlined-select-currency"
                select
                style={{ width: "22ch", marginRight: "22%", fontSize:'1.2em' }}
                value={this.state.setModel}
                label="Select Model"
                onChange={this.handleModelChange}
                >
                {models.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                    {option.label}
                    </MenuItem>
                ))}
                </TextField>
            </div>
            <div style={{
                marginTop: "2%",
                marginBottom: "1%",
                display: "flex",
                width: "34rem",
                alignItems: "center",
                justifyContent: "center",
                }}
            >
                <TextareaAutosize
                aria-label="minimum height"
                minRows={5}
                placeholder="Loading text...."
                style={{ width: "100%", fontFamily: 'Arial', fontSize: '1em'}}
                value={this.state.setSentence}
                disabled
                />
            </div>
            <div
                style={{
                marginTop: "1.5%",
                marginBottom: "1%",
                display: "flex",
                width: "34rem",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ccc",
                flexDirection: "column",
                padding: "1.5% 0 2%",
                }}
            >
                <>
                <div style={{ marginBottom: "2%" }}>
                    {this.state.micOn && (
                    <img
                        src={startAudio}
                        id="mic_image"
                        onClick={this.onMicClick}
                        alt="MIC"
                        style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "2%",
                        cursor: 'pointer',
                        }}
                    />
                    )}
                </div>
                <div style={{ display: "none" }}>
                    <AudioReactRecorder
                    state={this.state.recordAudio}
                    onStop={this.onStopRecording}
                    style={{ display: "none" }}
                    />
                </div>
                <div style={{ marginBottom: "2%" }}>
                    {!this.state.micOn && (
                    <img
                        src={stopAudio}
                        id="mic_image"
                        onClick={this.onStopClick}
                        alt="STOP"
                        style={{
                        display: "flex",
                        justifyContent: "center",
                        cursor: 'pointer',
                        }}
                    />
                    )}
                </div>

                {!this.state.micOn && (
                    <Typography
                    variant="body"
                    style={{
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "2%",
                    }}
                    >
                    Start Speaking...
                    </Typography>
                )}
                </>
                {this.state.audioUri ? (
                <audio
                    controls
                    src={this.state.audioUri}
                    style={{ marginBottom: "2%" }}
                ></audio>
                ) : (
                <></>
                )}
                <TextareaAutosize
                aria-label="minimum height"
                minRows={5}
                value={this.state.predictedText}
                placeholder="Transcribed text here"
                style={{ width: "95%", fontFamily: 'Arial', fontSize: '1em' }}
                disabled
                />
            </div>

            {this.state.show ? (
                <>
                <div
                    style={{
                    marginTop: "1%",
                    marginBottom: "1%",
                    display: "flex",
                    width: "34rem",
                    alignItems: "center",
                    justifyContent: "center",
                    }}
                >
                    {/* <Typography
                    fontSize="fontSize"
                    style={{ marginRight: "4%", marginTop: "1%", fontSize: '1.2em'}}
                    >
                    Provide your feedback
                    </Typography> */}
                    <Rating
                    name="customized-empty"
                    defaultValue={0}
                    size="large"
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    style={{ fontSize: "2rem" }}
                    onChange={this.handleRating}
                    />
                </div>

                <div
                    style={{
                    marginTop: "1%",
                    marginBottom: "1%",
                    display: "flex",
                    width: "32rem",
                    alignItems: "center",
                    justifyContent: "center",
                    }}
                >
                    <Button
                    id="back"
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{
                        width: "150px",
                        backgroundColor: "#1C9AB7",
                        borderRadius: "5px 5px 5px 5px",
                        color: "#FFFFFF",
                        height: "46px",
                        marginRight: "5%",
                    }}
                    onClick={this.updateFeedback}
                    >
                    {" "}
                        Submit feedback
                    </Button>
                    {/* <Button
                    id="back"
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={this.getWerScrore}
                    style={{
                        width: "135px",
                        backgroundColor: "#1C9AB7",
                        borderRadius: "5px 5px 5px 5px",
                        color: "#FFFFFF",
                        height: "46px",
                    }}
                    >
                    {" "}
                    Thank you
                    </Button> */}
                </div>
                </>
            ) : (
                <></>
            )}
        </Box>
      </div>
    );
  }
}

export default Mainform;
