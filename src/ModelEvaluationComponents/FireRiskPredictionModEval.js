import React from 'react';
import '../css/reactPaginationStyle.css';
import { MDBDataTable } from 'mdbreact';
// import CountySelector from '../Components/CountySelector';
import {Map, TileLayer, LayersControl, Marker, Popup, GeoJSON} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import Plot from 'react-plotly.js';
import FilterDivModEval from '../Components/FilterDivModEval';
import counties from '../counties.json';

const devUrl = '';
const prodUrl = 'https://wildfire-ml-flask.herokuapp.com';

class FireRiskPredictionModEval extends React.Component{

    constructor(props){
        super(props);
        
        this.state = {
            source: 'USGS',
            currentCounty: 'San Diego',
            lat: props.lat,
            lon: props.lon,
            data: null,
            currentView: 'Statistic View',
            startDate: null,
            endDate: null,
            features: ['OBJECTID', 'FIRE_NAME', 'STATE_NAME', 'COUNTY_NAME', 'DISCOVER_YEAR', 'POO_LATITUDE', 'POO_LONGITUDE', 'FIRE_SIZE_CLASS', 'TOTAL_ACRES_BURNED', 'STATION_NAME' ],
            summaryData: {
                'Weather Model 1': 'SVM',
                'Weather Model 2': 'XGBoost',
                'Weather Model 3': 'Random Forest',
                'Remote Sensing  Model 1': 'CNN',
                'Remote Sensing  Model 2': 'MultiLayer Perceptron',
                
            },
        }

        this.formatDate = this.formatDate.bind(this);
        this.getData = this.getData.bind(this);
        this.getUSDAFireData = this.getUSDAFireData.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.toggleFilterDivModEval = this.toggleFilterDivModEval.bind(this);
        this.changeCounty = this.changeCounty.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);

    }

    componentDidMount(){
        var today = new Date();

        var year = today.getFullYear();
        var month = today.getMonth();
        var day = today.getDate();

        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        if(month < 10){
            month = "0" + month;
        }
        if(day < 10){
            day = "0" + day;
        }

        year = parseInt(year)-1;

        var yearAgo = year+'-'+month+'-'+day;

        this.setState({
            startDate: yearAgo,
            endDate: today,
        })

        this.getUSDAFireData(yearAgo, today);
    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    }

    getData(){
        var startDate = document.getElementById('startDateInput').value;
        var endDate = document.getElementById('endDateInput').value;

        var today = new Date();
        today = this.formatDate(today);

        if(startDate > today || startDate > today || endDate > today || endDate > today){
            alert("Can't pick future dates.");
            return;
        }

        if(startDate > endDate){
            alert('Start date must be before end date.');
            return;
        }

        if(startDate === '' || endDate === ''){
            alert('Please select a start and end date');
            return;
        }

        if(this.state.source === 'USDA'){
            this.getUSDAFireData(startDate, endDate);
        }

    }

    getUSDAFireData(start, end){
        var lat = this.state.lat;
        var lon = this.state.lon;

        // var startYear = start.slice(0, 4);
        // var endYear = end.slice(0, 4);

        // var features = ['OBJECTID', 'FIRE_NAME', 'STATE_NAME', 'COUNTY_NAME', 'DISCOVER_YEAR', 'POO_LATITUDE', 'POO_LONGITUDE', 'FIRE_SIZE_CLASS', 'TOTAL_ACRES_BURNED', 'STATION_NAME' ]

        fetch(prodUrl + '/api/getUSDAFireData', {
            method: "POST",
            body: JSON.stringify({
                startDate: start,
                endDate: end,
                county: this.state.currentCounty,
            })
        })
        .then(res => res.json())
        .then(resData => {
            var rawData = resData['data'];

            var cols = [];
            var rows = [];
    
            for(const feature of this.state.features){
                var newColEntry = {
                    label: feature,
                    field: feature,
                    sort: 'asc',
                    width: 150,
                }
                cols.push(newColEntry);
            }

            console.log(rawData);
            if(rawData != null){
                if(rawData['error'] == null){
                    var i = 0;
                    for(i=0; i < rawData['features'].length; i++){
                        var newRowEntry = {}
                        for(var feature of this.state.features){
                            var val = rawData['features'][i]['attributes'][feature];
                            if(val == null){
                                val = ''
                            }
                            newRowEntry[feature] = val;
                        }
                        rows.push(newRowEntry);
                    }
                }
            }

            var data = {
                columns: cols,
                rows: rows,
            }

            this.setState({
                data: data,
            })

        })
    }

    handleViewChange(event){
        console.log('changed to: '+event.target.innerHTML);
        this.setState({
            currentView: event.target.innerHTML,
        })
    }

    toggleFilterDivModEval(){
        var filterDivModEval = document.getElementById('filterDivModEval');
        if(filterDivModEval.style.display == ''){
            filterDivModEval.style.display = 'none';
        }
        else{
            filterDivModEval.style.display = '';
        }
    }

    changeCounty(childData){
        this.setState({
            currentCounty: childData,
        })
    }

    handleStartDateChange(newStartDate){
        this.setState({
            startDate: newStartDate,
        })
    }

    handleEndDateChange(newEndDate){
        this.setState({
            endDate: newEndDate,
        })
    }


    render(){
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png')
        });

        var countyStyle = {
            color: '#4a83ec',
            weight: 1,
            fillColor: "#AED7FF",
            fillOpacity: 0.3,
        }

        return(
            <div className="jumbotron" style={{margin:'10px 0 50px 0', paddingTop:'20px', overflow:'auto'}}>

                <FilterDivModEval 
                    pageType='dataAnalysis'
                    dataType='fireRiskPrediction'
                    getData={this.getData}
                    changeCounty={this.changeCounty}
                    toggleFilterDivModEval={this.toggleFilterDivModEval}
                    currentView={this.state.currentView}
                    handleViewChange={this.handleViewChange}
                    handleStartDateChange={this.handleStartDateChange}
                    handleEndDateChange={this.handleEndDateChange}
                />

                <p>
                    <strong>Fire Risk Prediction  for: </strong>{this.state.currentCounty} County  date: {this.state.endDate}
                </p>
                <hr/>
                <div>
                    {
                        this.state.currentView === 'Statistic View'?
                        <div>
                            <h3>Evaluation - Weather Model:</h3>
                            <br/>
                            <div style={{display:'flex', flexWrap:'wrap'}}>
                                {
                                    Object.keys(this.state.summaryData).map(
                                        key => {
                                            return (
                                                <div key={key} style={{margin:'6px 24px 6px 0'}}>
                                                    <strong>{key}: </strong>{this.state.summaryData[key]}
                                                </div>
                                            )
                                        }
                                    )
                                }
                            </div>
                            <hr/>
                            <h4>1 - SVM </h4>
                            <br/>
                            <img src={process.env.PUBLIC_URL + 'images/svm1.png'} alt='svm1' width='60%' style={{margin:'20px 0'}}/>

                            <hr/>
                            <h4>2 - XGBoost </h4>
                            <br/>
                            <img src={process.env.PUBLIC_URL + 'images/xg1.png'} alt='svm1' width='60%' style={{margin:'20px 0'}}/>

                            <hr/>
                            <h4>3 - Random Forest </h4>
                            <br/>
                            <img src={process.env.PUBLIC_URL + 'images/rf1.png'} alt='svm1' width='60%' style={{margin:'20px 0'}}/>

                            <hr/>
                            <hr/>
                        
                       
                            <h3>Evaluation - Remote Sensing Model:</h3>
                            <br/>
                            <div style={{display:'flex', flexWrap:'wrap'}}>
                                {
                                    Object.keys(this.state.summaryData).map(
                                        key => {
                                            return (
                                                <div key={key} style={{margin:'6px 24px 6px 0'}}>
                                                    <strong>{key}: </strong>{this.state.summaryData[key]}
                                                </div>
                                            )
                                        }
                                    )
                                }
                            </div>
                            <hr/>
                            <h3>Evaluation - Remote Sensing Model:</h3>
                            <br/>
                            <hr/>
                            <h4>1 - CNN </h4>
                            <br/>
                            <img src={process.env.PUBLIC_URL + 'images/cnn1.png'} alt='svm1' width='60%' style={{margin:'20px 0'}}/>

                            <hr/>
                            <h4>2 - MultiLayer Perceptron </h4>
                            <br/>
                            <img src={process.env.PUBLIC_URL + 'images/mlp1.png'} alt='svm1' width='60%' style={{margin:'20px 0'}}/>


                        </div>
                        :
                        <div>
                            <h3>Evaluation - Weather Model:</h3>
                            <br/>
                            <hr/>
                            <h4>1 - SVM </h4>
                            <br/>
                            <img src={process.env.PUBLIC_URL + 'images/svm2.png'} alt='svm2' width='60%' style={{margin:'20px 0'}}/>
                            <hr/>
                            <h4>2 - XGBoost </h4>
                            <br/>
                            <img src={process.env.PUBLIC_URL + 'images/xg2.png'} alt='svm2' width='60%' style={{margin:'20px 0'}}/>
                            <hr/>
                            <h4>3 - Random Forest </h4>
                            <br/>
                            <img src={process.env.PUBLIC_URL + 'images/rf2.png'} alt='svm2' width='60%' style={{margin:'20px 0'}}/>
                            <hr/>
                            <hr/>
                            <h3>Evaluation - Remote Sensing Model:</h3>
                            <br/>
                            <hr/>
                            <h4>1 - CNN </h4>
                            <br/>
                            <img src={process.env.PUBLIC_URL + 'images/cnn2.png'} alt='svm2' width='60%' style={{margin:'20px 0'}}/>
                            <hr/>
                            <h4>2 - MultiLayer Perceptron </h4>
                            <img src={process.env.PUBLIC_URL + 'images/mlp2.png'} alt='svm2' width='60%' style={{margin:'20px 0'}}/>

                            <div style={{float:'right', padding:'6px', width:'230px'}}>
                            {
                                this.state.summaryData == null?
                                <p>Important statistics:</p>
                                :
                                <div>
                                    <p>Important statistics:</p>
                                    <hr/>
                                    <div style={{display:'flex', flexWrap:'wrap'}}>
                                        {
                                            Object.keys(this.state.summaryData).map(
                                                key => {
                                                    return (
                                                        <div key={key} style={{margin:'4px 0'}}>
                                                            <strong>{key}: </strong>{this.state.summaryData[key]}
                                                        </div>
                                                    )
                                                }
                                            )
                                        }
                                    </div>
                                </div>
                            }
                            </div>

                        </div>
                    }
                </div>

            </div>
        );
    }
}

export default FireRiskPredictionModEval;
