import React from 'react';
import DetectionDetail from './DetectionComponents/DetectionDetail.js';
// import './DetectionComponents/Pages.css';
// import './DetectionComponents/WildfireDetection.css';
import './DetectionComponents/example-fire-detection.png';
import DetectionList from './DetectionComponents/DetectionList.js';
import DetectionImage from './DetectionComponents/DetectionImage.js';


class WildfireDetection extends React.Component {
  state = {
    selectedFireImg: null,
    bounding_boxes: [],
    detection_scores: [],
    detection_classes: [],
    selectedFile: null,
    loading: false,
    inputFileUrl: null,
  };

  onFileChange = (event) => {
    // Update the state
    this.setState({ 
      inputFileUrl: URL.createObjectURL(event.target.files[0]),
      selectedFile: event.target.files[0]
    })
    console.log(event.target.files[0])
  }

  // on file upload (click the upload button)
  onFileUpload = () => {
    // Request made to the backend api
    // Call to fire detection API
    this.setState({ loading: true });
    this.detectFire();
    // wait 10 seconds to allow detectFire to process
    setTimeout(() => { this.detectScore(); }, 8000);

  }

  // Makes a call to prediction api results
  // which include detection boxes, scores, and classifications
  async detectScore() {
    // Fetch request to wpp module
    fetch('https://wpp-fire-detection-ml.herokuapp.com/result', {
      method: 'POST'
    })
    .then((response) => {
      const reader = response.body.getReader();
      return new ReadableStream({
        start(controller) {
          // The following function handles each data chunk
          function push() {
            // "done" is a Boolean and value a "Uint8Array"
            reader.read().then(({ done, value }) => {
              // Is there no more data to read?
              if (done) {
                // Tell the browser that we have finished sending data
                controller.close();
                return;
              }
              // Get the data and send it to the browser via the controller
              controller.enqueue(value);
              push();
            });
          };

          push();
        }
      })

    })
    .then(stream => new Response(stream))
    .then(response => {
      response.json().then(data => ({
        data: data,
        status: response.status
      }))
      .then(res => {
        const detectionBoxes = res.data.predictions[0].detection_boxes;
        const detectionScores = res.data.predictions[0].detection_scores;
        const detectionClasses = res.data.predictions[0].detection_classes;

        this.setDetectionInfo(detectionBoxes, detectionScores, detectionClasses);
      })
    })
    .catch(error => console.log("ERROR:", error));

  }

  // Set the state for the detection info
  setDetectionInfo = (boxes, scores, classes) => {
    let i = 0,
     realScores = [],
     boundingBoxes = [],
     realClasses = [];
    while(scores[i] > 0.90) {
      realScores.push(scores[i]);
      i++;
    }
    for(let j = 0; j < i; j++) {
      boundingBoxes.push(boxes[j]);
      realClasses.push(classes[j]);
    }

    this.setState({
      bounding_boxes: boundingBoxes,
      detection_scores: realScores,
      detection_classes: realClasses
    })

  }

  
  // Comsumes the ReadableStream from the Fetch call
  async detectFire() {
    const formData = new FormData();
    formData.append('file', this.state.selectedFile);

    fetch('https://wpp-fire-detection-ml.herokuapp.com/predict', {
      method: 'POST',
      body: formData,

    })
    .then(res => {
      // Start loading
      //this.setState({ loading: true });

      const reader = res.body.getReader();
      if(!res.ok) {
        throw Error("Error getting the predict image")
      }
      return new ReadableStream({
        start(controller) {
          return pump();
          function pump() {
            return reader.read().then(({ done, value }) => {
              // When no more data needs to be consumed, close the stream
              if (done) {
                  controller.close();
                  return;
              }
              // Enqueue the next data chunk into our target stream
              controller.enqueue(value);
              return pump();
            });
          }
        }
      })
    })
    .then(stream => new Response(stream))
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob))
    .then(url => {

      // set the state of Fire Image URL to the made url
      this.setState({
        fireImgUrl: url,
        loading: false
      });
    })
    .catch(err => console.error(err));
  }

  // Fire Functions
  onFireSelect = (fire) => {
    this.setState({ selectedFire: fire });
  }

  render() {
    return (
      <div>
        <div>
          <div style={{position:'absolute', marginTop:'72px', zIndex:'-100'}}>
            <div style={{margin:'10px 0 0 20px', width:'75vw'}}>

              {/* <h1>Wildfire Detection</h1> */}
              
              <div style={{width:'60%', float:'left'}}>
              
                <div style={{border:'1px solid grey', borderRadius:'10px', padding:'10px'}}>
                  <h5 style={{fontWeight:'bold'}}>Input Image:</h5>
                  <hr/>
                  <input type='file' onChange={this.onFileChange} />
                  <br/>
                  <br/>
                  <button className='btn btn-primary' onClick={this.onFileUpload}>Run detection</button>
                  <br/>
                  <br/>

                  {
                    this.state.selectedFile === null?
                    <div></div>
                    :
                    <img src={this.state.inputFileUrl} width='100%' />
                  }
                </div>

                <br/>

                <div style={{border:'1px solid grey', borderRadius:'10px', padding:'10px'}}>
                  <h5 style={{fontWeight:'bold'}}>Output Image</h5>
                  <hr/>
                  <DetectionImage url={this.state.fireImgUrl} loading={this.state.loading} />

                </div>

              </div>


              <div style={{width:'35%', float:'right'}}>

                <div style={{border:'1px solid grey', borderRadius:'10px', padding:'10px'}}>
                  <h5 style={{fontWeight:'bold'}}>Detection List</h5>
                  <hr/>
                  <DetectionList
                    boxes={this.state.bounding_boxes}
                    scores={this.state.detection_scores}
                    classes={this.state.detection_classes}
                  />
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

    );
  }

};

export default WildfireDetection;
