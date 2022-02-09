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
// import startAudio from "../../assets/start.svg";
// import stopAudio from "../../assets/stop.svg";
import FetchModel from "../services/fetchModel";
import FetchSentence from "../services/fecthSentence";
import SubmitFeedback from "../services/submitfeedback";
import ExportResults from "../services/exportresults";
import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import GetTranscription from "../services/getTranscription";
import CircularProgress from "./ProgressBar";
import WerCerScore  from "../services/werCerScore";
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import MicIcon from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';
import Snackbar from "./Snackbar";

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
      currentCount: 21,
      dialogMessage: null,
      timeOut: 3000,
      variant: "info",
    };
  }

  timer() {
    console.log('*timer*', this.state.currentCount)
    this.setState({
      currentCount: this.state.currentCount - 1
    })
    if(this.state.currentCount < 1) { 
      this.onStopClick();
      clearInterval(this.intervalId);
    }
  }

  clearState = () => {
    this.setState(
      {
        rating: 0,
        micOn: true,
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
    this.getSentence(event.target.value);
  };

  // for model selection
  handleModelChange = (event) => {
    this.setState({
      setModel: event.target.value,
      rating: 0,
    });
  };

  componentDidMount() {
    this.setState({ loading: true });
    this.getModel("en", "model");
    this.getSentence();
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
          this.setState({ modelID: resData.model_ids[0], loading: false, setSentence: '' });
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

  getSentence = (lan) => {
    const apiObj = lan ? new FetchSentence(lan) : new FetchSentence(this.state.lang);
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
        this.getSentence();
      })
      .catch((error) => {
        console.log("error", error);
      });
  };


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
        console.log('resdata', resData);
        this.setState({ loading: false });
        this.setState({ dialogMessage: 'Please provide your feedback' })
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
    if (this.state.setSentence && !this.state.predictedText) {
      this.intervalId = setInterval(this.timer.bind(this), 1000);
      this.setState({
        micOn: false,
        recordAudio: RecordState.START,
        audioUri: "",
        predictedText: "",
      });
    } else if (this.state.setSentence && this.state.predictedText) {
      this.intervalId = setInterval(this.timer.bind(this), 1000);
      this.setState({
        setSentence:'',
        rating: 0,
        micOn: true,
        sessionID: "",
        audioUri: "",
        predictedText: "",
        wer: "",
        cer: "",
        recordAudio: "",
      });
      this.getSentence();
    }
  };

  onStopClick = () => {
    this.setState({
      micOn: true,
      recordAudio: RecordState.STOP,
      loading: true,
    });
  };

  snackBarMessage = () => {
    return (
        <div>
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                open={!this.state.timeOut}
                autoHideDuration={this.state.timeOut}
                variant={this.state.variant}
                message={this.state.dialogMessage}
            />
        </div>
    );
  };

  render() {
    return (
        <div>
          <Grid container>
            <Grid item xs>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4" style={{textAlign:'center', margin: '3% 0'}}>Speech Model Recognition</Typography>
              <Paper style={{ marginBottom: "4%"}}>
                <Box component="form" sx={{  }} noValidate  autoComplete="off">
                  <Card>
                    <CardContent>
                        <Grid style={{ marginTop: "2%", display: "flex"}} >
                           <Grid item xs>
                            <TextField
                              id="outlined-select-currency"
                              select
                              style={{ width: "96%", fontSize:'1.2em'}}
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
                           </Grid>
                           <Grid item xs>
                              <TextField
                                id="outlined-select-currency"
                                select
                                style={{ width: "96%", fontSize:'1.2em' }}
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
                           </Grid>
                        </Grid>
                        <Grid style={{ marginTop: "5%", marginBottom: "1%", display: "flex", flexDirection: "column"}} >
                            <Typography variant="body1" style={{color: 'rgba(0, 0, 0, 0.54)', marginBottom: '1%' }}>Please read</Typography>
                            <TextareaAutosize aria-label="minimum height"  minRows={5}  placeholder="Loading text...."  
                            style={{ fontFamily: 'Arial', fontSize: '1.5rem', lineHeight: '1.4'}}  value={this.state.setSentence}  disabled  />
                        </Grid>
                        <Grid  style={{ marginTop: "4%", marginBottom: "1%", display: "flex", flexDirection: "column", alignItems: 'center' }} >
                            <>
                            <Grid>
                                {this.state.micOn && (
                                  <IconButton aria-label="Record Audio" onClick={this.onMicClick} 
                                    style={{ background: '#1ea46c', color: '#ffffff'}}> 
                                    <MicIcon style={{fontSize: '3.5rem'}} />
                                  </IconButton>
                                // <img src={startAudio} id="mic_image" onClick={this.onMicClick} alt="MIC"
                                // style={{ display: "flex",  justifyContent: "center",  marginBottom: "2%",  cursor: 'pointer' }}
                                // />
                                )}
                            </Grid>
                            <Grid style={{ display: "none" }}>
                                <AudioReactRecorder
                                state={this.state.recordAudio}
                                onStop={this.onStopRecording}
                                style={{ display: "none" }}
                                />
                            </Grid>
                            <Grid style={{ marginBottom: "2%" }}>
                                {!this.state.micOn && (
                                <IconButton aria-label="Stop Audio" onClick={this.onStopClick} 
                                  style={{ background: '#F44336', color: '#ffffff'}}> 
                                  <StopIcon style={{fontSize: '3.5rem'}} />
                                </IconButton>
                                // <img src={stopAudio} id="mic_image" onClick={this.onStopClick} alt="STOP"
                                //     style={{  display: "flex", justifyContent: "center", cursor: 'pointer' }}
                                // />
                                )}
                            </Grid>

                            {!this.state.micOn && (
                              <Typography variant="body2" style={{  textAlign: "center",  display: "flex",  justifyContent: "center", marginBottom: "2%"}}>
                              Start speaking. We are recording...
                              </Typography>
                            )}
                            </>
                            {this.state.audioUri ? (
                            <audio  controls  src={this.state.audioUri} style={{ marginBottom: "2%" }}
                            ></audio>
                            ) : (
                            <></>
                            )}

                            {this.state.loading ? (
                              <CircularProgress variant="determinate" size={40} thickness={4} token={true} val={1000} eta={2000 * 1000} />
                            ) : (
                              <></>
                            )}
                            {this.state.loading ? (
                              <Typography variant="body2" style={{  textAlign: "center",  display: "flex",  justifyContent: "center", marginBottom: "2%"}}>
                              Text is getting transcribed...
                              </Typography>
                            ) : (
                              <></>
                            )}
                        </Grid>
                        <Grid  style={{ marginTop: "4%", marginBottom: "1%", display: "flex", flexDirection: "column" }} >
                            <Typography variant="body1" style={{color: 'rgba(0, 0, 0, 0.54)', marginBottom: '1%' }}>Transcribed text</Typography>
                            <TextareaAutosize
                            aria-label="minimum height"
                            minRows={5}
                            value={this.state.predictedText}
                            placeholder="Transcribed text here"
                            style={{ fontFamily: 'Arial', fontSize: '1.5rem', lineHeight: '1.4' }}
                            disabled
                            />
                        </Grid>
                    </CardContent>
                    <CardActions style={{justifyContent: 'center'}}>
                        {this.state.show ? (
                            <>
                            <Grid style={{ marginBottom: "3%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: 'center'}}>
                                <Rating  name="customized-empty" defaultValue={0}  size="large" emptyIcon={<StarBorderIcon fontSize="inherit" />}  
                                style={{ marginBottom: "6%", fontSize: "4rem" }}
                                onChange={this.handleRating}
                                />

                                <Button id="back" variant="contained" size="large" color="primary" onClick={this.updateFeedback} >
                                {" "}  Submit feedback
                                </Button>
                            </Grid>
                            </>
                        ) : (
                            <></>
                        )}
                    </CardActions>
                  </Card>
                  {this.state.dialogMessage && this.snackBarMessage()}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs>
            </Grid>
          </Grid>
      </div>
    );
  }
}

export default Mainform;
