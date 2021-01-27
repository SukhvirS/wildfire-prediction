import React from 'react';
import './css/App.css';

import {BrowserRouter, Route} from 'react-router-dom';

import DataCollection from './DataCollection';
import Preprocessing from './Preprocessing';
import DataAnalysis from './DataAnalysis';
import Monitoring from './Monitoring';
// import Detection2 from './ImageDetection';
import Risk from './Risk';
import Progression from './Progression';
import ModelEvaluation from './ModelEvaluation';
// import Flask from'./Flask-example';

function App() {
  return (
    <BrowserRouter>
      <Route exact path="/" component={DataCollection}></Route>
      <Route path="/preprocessing" component={Preprocessing}></Route>
      <Route path="/data-analysis" component={DataAnalysis}></Route>
      <Route path="/detection" component={Monitoring}></Route>

      {/* <Route path="/imageDetection" component={Detection2}></Route> */}

      <Route path="/risk" component={Risk}></Route>
      <Route path="/progression" component={Progression}></Route>
      <Route path="/model-evaluation" component={ModelEvaluation}></Route>
      
      {/* <Route path='/flask' component={Flask}></Route> */}
    </BrowserRouter>
  );
}

export default App;
