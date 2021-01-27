import React from 'react';
import '../css/reactPaginationStyle.css';
import { MDBDataTable } from 'mdbreact';
// import CountySelector from '../Components/CountySelector';
import {Map, TileLayer, LayersControl, Marker, Popup, GeoJSON} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import Plot from 'react-plotly.js';
import FilterDiv from '../Components/FilterDiv';
import counties from '../counties.json';

const devUrl = '';
const prodUrl = 'https://wildfire-ml-flask.herokuapp.com';

class WeatherDataCollection extends React.Component{

    constructor(props){
        super(props);
        
        this.state = {
            source: 'NOAA',
            lat: props.lat,
            lon: props.lon,
            currentCounty: 'Alameda',
            data: null,
            currentView: 'Table View',
            currentMarker: null,
            weatherStationData: null,
            currentWeatherStation: null,
            weatherStationFeatures: ['datacoverage', 'elevation', 'elevationUnit', 'id', 'latitude', 'longitude', 'maxdate', 'mindate', 'name'],
            startDate: null,
            endDate: null,

        }

        this.getData = this.getData.bind(this);
        this.getNOAAdata = this.getNOAAdata.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.changeCounty = this.changeCounty.bind(this);
        this.toggleFilterDiv = this.toggleFilterDiv.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleWeatherStationChange = this.handleWeatherStationChange.bind(this);
        this.onCountyMouseout = this.onCountyMouseout.bind(this);
        this.onCountyMouseover = this.onCountyMouseover.bind(this);
        this.onEachCounty = this.onEachCounty.bind(this);
        this.getFeatureData = this.getFeatureData.bind(this);
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

        var monthAgo = year+'-'+month+'-'+day;

        this.setState({
            startDate: monthAgo,
            endDate: today,
        })

        this.getNOAAdata(monthAgo, today);

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

        if(this.state.source === 'NOAA'){
            this.getNOAAdata(startDate, endDate);
        }
    }

    getNOAAdata(start, end){
        this.setState({
            data: null,
        })

        fetch(prodUrl + '/api/getNOAAdata', {
            method:'POST',
            body: JSON.stringify({
                startDate: start,
                endDate: end,
                county: this.state.currentCounty,
            })
        })
        .then(res => res.json())
        .then(response => {
            var rawData = response['rawData'];
            var weatherStationData = response['weatherStationData']
            weatherStationData = JSON.parse(weatherStationData)
            weatherStationData = weatherStationData['results'];

            this.setState({
                weatherStationData: weatherStationData,
            })

            var parsedData = JSON.parse(rawData);

            var cols = [];
            var rows = [];
        
            for(const key in parsedData){
                var newColEntry = {
                    label: key,
                    field: key,
                    sort: 'asc',
                    width: 150,
                }
                cols.push(newColEntry);
            }

            console.log(parsedData);
            if(parsedData['DATE'] != null){
                for(var i=0; i<Object.keys(parsedData['DATE']).length; i++){      
                    var newRowEntry = {}
                    for(const key in parsedData){
                        var val = parsedData[key][i];
                        if (val == null){
                            val = ''
                        }
                        newRowEntry[key] = val
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
        // console.log('changed to: '+event.target.innerHTML);
        this.setState({
            currentView: event.target.innerHTML,
        })
    }

    handleWeatherStationChange(newWeatherStation){
        this.setState({
            currentWeatherStation: newWeatherStation,
        })
    }

    onCountyMouseover(event){
        event.target.setStyle({
            fillOpacity: 0.9,
        });
    }

    onCountyMouseout(event){
        event.target.setStyle({
            fillOpacity: 0.3,
        });
    }

    onEachCounty(county, layer){
        var countyName = county.properties.name;
        layer.bindPopup(countyName);

        layer.on({
            mouseover: this.onCountyMouseover,
            mouseout: this.onCountyMouseout,
        })
    }

    getFeatureData(feature){
        var data = [];
        var temp = {};
        for(var row of this.state.data['rows']){
            if(!(row['STATION'] in temp)){
                temp[row['STATION']] = {
                    'x': [],
                    'y': [],
                    type: 'line',
                    name: row['STATION'],
                }
            }
            temp[row['STATION']]['x'].push(row['DATE']);
            temp[row['STATION']]['y'].push(row[feature]);
        }
        for(var station of Object.keys(temp)){
            data.push(temp[station]);
        }
        return data;
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

        var tavg = null;
        var tmin = null;
        var tmax = null;
        if(this.state.data != null){
            tavg = this.getFeatureData('TAVG');
            tmin = this.getFeatureData('TMIN');
            tmax = this.getFeatureData('TMAX');
        }

        return(
            <div className="jumbotron" style={{margin:'10px 0 50px 0', paddingTop:'20px', overflow:'auto'}}>
                <FilterDiv 
                    pageType='dataCollection'
                    dataType='weather'
                    getData={this.getData}
                    changeCounty={this.changeCounty}
                    toggleFilterDiv={this.toggleFilterDiv}
                    currentView={this.state.currentView}
                    handleViewChange={this.handleViewChange}
                    handleStartDateChange={this.handleStartDateChange}
                    handleEndDateChange={this.handleEndDateChange}
                />
                <p>
                    <strong>Data for: </strong>{this.state.currentCounty} County ({this.state.startDate} to {this.state.endDate})
                </p>
                <div>
                    {
                        this.state.currentView === 'Table View'?
                        <div>
                            {
                                !this.state.data?
                                <div>Getting data...</div>
                                :
                                <div>
                                    <MDBDataTable responsive
                                    striped
                                    bordered
                                    data={this.state.data}
                                    />
                                    <br/>
                                    <hr/>

                                    <h4>Graphs</h4>
                                    <br/>
                                    <Plot
                                        style = {{height:'400px'}}
                                        data = {tavg}
                                        layout = {{showlegend: true, title:'TAVG over time'}}
                                        config = {{responsive:true }}
                                    />
                                    <br/>
                                    <Plot
                                        style = {{ height:'400px'}}
                                        data = {tmin}
                                        layout = {{showlegend:true, title: 'TMIN over time' }}
                                        config = {{responsive:true }}
                                    />
                                    <br/>
                                    <Plot
                                        style = {{height:'400px'}}
                                        data = {tmax}
                                        layout = {{showlegend:true, title:'TMAX over time' }}
                                        config = {{responsive:true }}
                                    />

                                </div>
                                
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

                                    <LayersControl.Overlay name="Show Counties" >
                                        <GeoJSON data={counties.features}  style={countyStyle} onEachFeature={this.onEachCounty}/>
                                    </LayersControl.Overlay>

                                </LayersControl>


                                <MarkerClusterGroup>
                                    {
                                        this.state.weatherStationData == null?
                                        <div>Waiting for data to load...</div>
                                        :
                                        this.state.weatherStationData.map(
                                            marker => {
                                                return (
                                                    <Marker position={[marker['latitude'], marker['longitude']]} key={marker['id']} onclick={() => this.handleWeatherStationChange(marker)}>
                                                        <Popup>
                                                            <p>ID: {marker['id']}</p>
                                                            <p>Lat: {marker['latitude']}</p>
                                                            <p>Lon: {marker['longitude']}</p>
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
                                this.state.currentWeatherStation == null?
                                <h3>Select a weather station for more info.</h3>
                                :
                                <div>
                                    <h3>Station info.</h3>
                                    <hr/>
                                    {
                                        this.state.weatherStationFeatures.map(
                                            feature => {
                                                return (
                                                <div key={feature}>
                                                    <strong>{feature}: </strong>{this.state.currentWeatherStation[feature]}
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

export default WeatherDataCollection;
