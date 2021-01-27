import React from 'react';
import CountySelector from '../Components/CountySelector';
import { MDBDataTable } from 'mdbreact';
import {Map, TileLayer, LayersControl, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import FilterDiv from '../Components/FilterDiv';


const devUrl = '';
const prodUrl = 'https://wildfire-ml-flask.herokuapp.com';

class FireHistoryDataCollection extends React.Component{

    constructor(props){
        super(props);
        
        this.state = {
            source: 'USDA',
            lat: props.lat,
            lon: props.lon,
            currentCounty: 'Alameda',
            data: null,
            currentView: 'Table View',
            currentFire: null,
            features: ['OBJECTID', 'FIRE_NAME', 'STATE_NAME', 'COUNTY_NAME', 'DISCOVER_YEAR', 'POO_LATITUDE', 'POO_LONGITUDE', 'FIRE_SIZE_CLASS', 'TOTAL_ACRES_BURNED', 'STATION_NAME' ],
        }

        this.getData = this.getData.bind(this);
        this.getUSDAFireData = this.getUSDAFireData.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.toggleFilterDiv = this.toggleFilterDiv.bind(this);
        this.changeCounty = this.changeCounty.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
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

            if(rawData['features'] != null){
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

            var data = {
                columns: cols,
                rows: rows,
            }

            this.setState({
                data: data,
            })

        })
    }

    toggleFilterDiv(){
        var filterDiv = document.getElementById('filterDiv');
        if(filterDiv.style.display == ''){
            filterDiv.style.display = 'none';
        }
        else{
            filterDiv.style.display = '';
        }
    }

    changeCounty(childData){
        this.setState({
            currentCounty: childData,
        })
    }

    handleViewChange(event){
        console.log('changed to: '+event.target.innerHTML);
        this.setState({
            currentView: event.target.innerHTML,
        })
    }

    handleFireChange(newFire){
        this.setState({
            currentFire: newFire,
        })
    }

    render(){

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('../images/fire.png'),
            iconUrl: require('../images/fire.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });

        return(
            <div className="jumbotron" style={{margin:'10px 0 50px 0', paddingTop:'20px', overflow:'auto'}}>
                <FilterDiv
                    pageType='dataCollection' 
                    dataType='fireHistory'
                    getData={this.getData}
                    changeCounty={this.changeCounty}
                    toggleFilterDiv={this.toggleFilterDiv}
                    currentView={this.state.currentView}
                    handleViewChange={this.handleViewChange}
                />
                <div>
                    {
                        this.state.currentView === 'Table View'?
                        <div>
                        {
                            !this.state.data?
                            <div>Getting data...</div>
                            :
                            <MDBDataTable responsive
                            striped
                            bordered
                            data={this.state.data}
                            />
                        }
                    </div>
                    :
                    <div>
                        <Map style={{height:'calc(100vh - 200px)', width:'calc(100vw - 600px)', border:'1px solid black', float:'left'}} zoom={6} center={[this.state.lat, this.state.lon]}>

                            <LayersControl position="topright">

                                <LayersControl.BaseLayer name="Topology" checked>
                                    <TileLayer
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}.png"
                                    />
                                </LayersControl.BaseLayer>

                                <LayersControl.BaseLayer name="Street">
                                    <TileLayer
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                </LayersControl.BaseLayer>

                                <LayersControl.BaseLayer name="Satellite">
                                    <TileLayer
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"
                                    />
                                </LayersControl.BaseLayer>

                                <LayersControl.BaseLayer name="Terrain">
                                    <TileLayer
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}.png"
                                    />
                                </LayersControl.BaseLayer>

                                <LayersControl.BaseLayer name="Dark">
                                    <TileLayer
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                    />
                                </LayersControl.BaseLayer>

                            </LayersControl>

                            <MarkerClusterGroup>
                                {
                                    this.state.data == null?
                                    <div>Waiting for data to load...</div>
                                    :
                                    this.state.data.rows.map(
                                        marker => {
                                            return (
                                                <Marker position={[marker['POO_LATITUDE'], marker['POO_LONGITUDE']]} key={marker['OBJECTID']} onclick={() => this.handleFireChange(marker)}>
                                                    <Popup>
                                                        <p>Object ID: {marker['OBJECTID']}</p>
                                                        <p>Lat: {marker['POO_LATITUDE']}</p>
                                                        <p>Lon: {marker['POO_LONGITUDE']}</p>
                                                    </Popup>
                                                </Marker>
                                            )
                                        }
                                    )
                                }
                            </MarkerClusterGroup>
                        </Map>
                        <div style={{float:'right', padding:'6px', width:'230px'}}>
                        {
                            this.state.currentFire == null?
                            <h3>Select a fire for more info.</h3>
                            :
                            <div>
                                <h3>Fire Information</h3>
                                <hr/>
                                {
                                    this.state.features.map(
                                        feature => {
                                            return (
                                               <div key={feature}>
                                                   <strong>{feature}: </strong>{this.state.currentFire[feature]}
                                                   <br/>
                                                </div>
                                            )
                                        }
                                    )
                                }
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

export default FireHistoryDataCollection;
