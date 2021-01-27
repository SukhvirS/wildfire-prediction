import React from 'react';
import {Map, GeoJSON, TileLayer, LayersControl, FeatureGroup, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import counties from './counties.json';
import L from 'leaflet';
import MyNavbar from './Components/MyNavbar';
import CaFireData from './DetectionComponents/fire_history_ca.json';
// import ImageDetection from './ImageDetection';
import WildfireDetection from './WildfireDetection';

import RedDot from './images/redDot.svg';

const myIcon = L.icon({
    iconUrl: RedDot,
    iconSize: [32,32],
});

class Monitoring extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            currentCounty: null,
            currentFire: null,
            latitude: 37.334665328,
            longitude: -121.875329832,
            selectedYear: 'Current',
            currentView: 'Monitoring',
            events: null
        };

        this.onCountyClick = this.onCountyClick.bind(this);
        this.onEachCounty = this.onEachCounty.bind(this);
        this.onCountyMouseover = this.onCountyMouseover.bind(this);
        this.onCountyMouseout = this.onCountyMouseout.bind(this);
        this.makeFireMarkers = this.makeFireMarkers.bind(this);
        this.handleFireSelect = this.handleFireSelect.bind(this);
        // this.handleCitySearch = this.handleCitySearch.bind(this);
       
        this.handleYearChange = this.handleYearChange.bind(this);
        this.changeView = this.changeView.bind(this);
        this.makeCurrentFireMarkers = this.makeCurrentFireMarkers.bind(this);
        this.setCurrentFire = this.setCurrentFire.bind(this);
    }

    async componentDidMount(){
        const res = await fetch('https://eonet.sci.gsfc.nasa.gov/api/v2.1/events')
        const {events} = await res.json()
        // console.log(events)
        this.setState({
            events: events
        })
    }

    onCountyClick(event){
        // console.log(event.target.feature.properties.name + ' clicked.');
        this.setState({
            currentCounty: event.target.feature.properties.name,
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
        // var countyName = county.properties.name;
        // layer.bindPopup(countyName);

        layer.on({
            click: this.onCountyClick,
            mouseover: this.onCountyMouseover,
            mouseout: this.onCountyMouseout,
        })
    }

    makeFireMarkers(year){
        var fireMarkers = []
        Object.keys(CaFireData).map((key) => {
            if(CaFireData[key]['POO_LATITUDE']!=null && CaFireData[key]['POO_LONGITUDE']!=null){
                if(year==CaFireData[key]['DISCOVER_YEAR']){
                fireMarkers.push( 
                    <Marker position={[CaFireData[key]['POO_LATITUDE'], CaFireData[key]['POO_LONGITUDE']]}
                    onclick={this.handleFireSelect} key={key} acres={20} icon={myIcon}>
                        <Popup>
                            <h5>{CaFireData[key]['FIRE_NAME']}</h5>
                            <p style={{display:''}}>Acres Burned: {CaFireData[key]['TOTAL_ACRES_BURNED']}</p>
                            <p style={{display:''}}>Year: {CaFireData[key]['DISCOVER_YEAR']}</p>
                        </Popup>
                    </Marker>
            );}
        }})
        return fireMarkers;
    }

    handleYearChange(event){
        this.setState({currentFire:null, selectedYear: event.target.value});
    }

    handleFireSelect(event){
        // console.log(event);
        // alert(event.target._popup.options.children);
        var fire = {
            'name': event.target._popup.options.children[0].props.children,
            'latitude': event.latlng.lat,
            'longitude': event.latlng.lng,
            'acres burned': event.target._popup.options.children[1].props.children,
            'date': event.target._popup.options.children[2].props.children,  
        }
        this.setState({
            currentFire: fire,
        })
        // console.log(fire);
    }

    // handleCitySearch(event){
    //     event.preventDefault();
    //     var cityInput = document.getElementById('citySearchInput').value;

    //     var url = new URL('http://api.positionstack.com/v1/forward'),
    //         params = {
    //             access_key: '559dea75d5799296cfe4e650c073d4b2',
    //             query: cityInput,
    //         }
    //     Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    //     fetch(url)
    //     .then(res => res.json())
    //     .then(response => {
    //         // console.log(data);
    //         if(response['data'].length === 0){
    //             alert('Please enter a valid location');
    //         }
    //         else{
    //             var data = response['data'][0];
    //             this.setState({
    //                 latitude: data['latitude'],
    //                 longitude: data['longitude']
    //             })
    //         }
    //     })
    //     document.getElementById('citySearchInput').value = '';
    // }

    changeView(newView){
        this.setState({
            currentView: newView
        })
    }

    makeCurrentFireMarkers(){
        var markers = []
        var events = this.state.events;
        var e = null;

        if(events != null){
            for(var i=0; i<events.length; i++){
                e = events[i]
                var pos = [ e['geometries'][0]['coordinates'][1], e['geometries'][0]['coordinates'][0] ]

                // console.log(e)

                const fire = {
                    'name': e['title'],
                    'latitude': pos[0],
                    'longitude': pos[1],
                    'date': 'Current',
                    'acres burned': 'Unknown',
                }

                if(pos[0] != undefined){
                    markers.push(
                        <Marker position={pos} key={i} onClick={this.setCurrentFire.bind(this, fire)} icon={myIcon}>
                            <Popup>
                                <h5>{e['title']}</h5>
                                <p style={{display:''}}>Acres Burned: Unknown</p>
                                <p style={{display:''}}>Year: Current</p>
                            </Popup>
                        </Marker>
                    )
                }
            }
        }
        return markers
    }

    setCurrentFire(newFire){
        this.setState({
            currentFire: newFire
        })
    }

    render(){        
        // var position = [37.334665328, -121.875329832];
        var fmarkers = null;
        {
            this.state.selectedYear == 'Current'?
            fmarkers = this.makeCurrentFireMarkers()
            :
            fmarkers = this.makeFireMarkers(this.state.selectedYear)
        }

        // var fmarkers = this.makeFireMarkers(this.state.selectedYear);

        var countyStyle = {
            color: '#4a83ec',
            weight: 1,
            fillColor: "#AED7FF",
            fillOpacity: 0.3,
        }

        var dotStyles = {
            redDot: {
                height: '14px',
                width: '14px',
                backgroundColor: '#FF5353',
                borderRadius: '50%',
                display: 'inline-block'
            },
            orangeDot: {
                height: '14px',
                width: '14px',
                backgroundColor: '#FFBA53',
                borderRadius: '50%',
                display: 'inline-block'
            },
            greenDot: {
                height: '14px',
                width: '14px',
                backgroundColor: '#44C37E',
                borderRadius: '50%',
                display: 'inline-block'
            },
            blueDot: {
                height: '14px',
                width: '14px',
                backgroundColor: '#1092DC',
                borderRadius: '50%',
                display: 'inline-block'
            }
        }

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png")
        });

        var header = null;
        {
            this.state.currentView == 'Monitoring'?
            header = <h1 className='mt-2'>Fire Monitoring <a style={{color:'grey'}} onClick={this.changeView.bind(this, 'Detection')}>/ Detection</a></h1>
            :
            header = <h1 className='mt-2'>Fire <a style={{color:'grey'}} onClick={this.changeView.bind(this, 'Monitoring')}>Monitoring / </a>Detection</h1>
        }


        return(
            <div>
                <MyNavbar/>

                <div style={{marginLeft:'15rem'}}>

                    <div style={{position:'fixed', backgroundColor:'#f8f9fa', height:"72px", width:"100%",  borderLeft:'1px solid #d9dadb', borderBottom:"1px solid #d9dadb", paddingLeft:"20px"}}>
                        {/* <h1 className='mt-2'>Fire Monitoring / Detection</h1> */}
                        {header}
                    </div>

                    {
                        this.state.currentView == 'Monitoring'?
                        
                        <div style={{wdith:'60vw', position:'absolute', marginTop:'72px', zIndex:'-100'}}>
                            <div style={{width:"100%"}}>
                                <Map style={{height:'calc(100vh - 72px)', width:'calc(100vw - 500px)', float:'left'}} zoom={8} center={[this.state.latitude, this.state.longitude]}>

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

                                        <LayersControl.Overlay name="Show Markers" checked>
                                            <FeatureGroup>
                                                {fmarkers}
                                            </FeatureGroup>
                                        </LayersControl.Overlay>

                                        <LayersControl.Overlay name='Show Legend' checked>
                                            <FeatureGroup>

                                            </FeatureGroup>
                                        </LayersControl.Overlay>
                                        
                                    </LayersControl>
                                </Map>

                                <div style={{width:'260px', float:'right', borderLeft:'1px solid #d9dadb'}}>
                                    {/* <div style={{marginTop:'16px'}}>
                                        <form onSubmit={this.handleCitySearch}>
                                            <div className="col-lg-10 mb-3">
                                                <div className="input-group" style={{width:'226px'}}>
                                                    <input type="text" className="form-control rounded-0" id="citySearchInput" placeholder="City Name" required />
                                                    <div className="input-group-prepend">
                                                        <input type="submit" value="Search" className="btn btn-primary btn-sm rounded-0" id="inputGroupPrepend2" style={{backgroundColor:'#1580fb'}}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div> */}
                                        <div style={{marginTop:'16px'}}>
                                            <div className="col-lg-10 mb-3">
                                                <div className="input-group" style={{width:'226px'}}>
                                                    <label style={{width:'100%'}}>Select a Year
                                                    <select className="form-control rounded-0" value={this.state.selectedYear} onChange={this.handleYearChange}>
                                                    <option value="2015">2015</option>
                                                    <option value="2016">2016</option>
                                                    <option value="2017">2017</option>
                                                    <option value="2018">2018</option>
                                                    <option value="2019">2019</option>
                                                    <option value='Current'>Current</option>
                                                    </select>
                                                    </label>
                                                    <div className="input-group-prepend">  
                                                    </div>
                                                </div>
                                            </div>
                                    
                                        </div>
                                        <hr style={{margin:'16px'}}/>
{/* 
                                        <div style={{border:'1px solid #d9dadb', margin:'16px', padding:'10px', backgroundColor:'#E9ECEF'}}>
                                            <h6>Time of Detection</h6>
                                            <hr style={{margin:'0 0 6px 0'}}/>
                                            <span style={dotStyles.redDot}></span>
                                            &nbsp;&nbsp; 0 - 1 hour ago
                                            <br/>
                                            <span style={dotStyles.orangeDot}></span>
                                            &nbsp;&nbsp; 1 - 6 hours ago
                                            <br/>
                                            <span style={dotStyles.greenDot}></span>
                                            &nbsp;&nbsp; 6 - 12 hours ago
                                            <br/>
                                            <span style={dotStyles.blueDot}></span>
                                            &nbsp;&nbsp; Past Fires
                                            <br/>
                                        </div> */}

                                        <div style={{margin:'0 16px'}}>
                                            <h4 style={{margin:'0'}}>Information</h4>
                                            <hr style={{margin:'0'}}/>
                                            <p>Fire Data From California Fire History</p>
                                        </div>

                                        <div style={{height:'100%', overflow:'auto', margin:'8px 16px'}}>
                                        {
                                            this.state.currentFire == null?
                                            <p>Select a fire to view data</p>
                                            :
                                            <div>
                                                <strong>Name: </strong>{this.state.currentFire.name}
                                                <br/>
                                                <strong>Latitude: </strong>{this.state.currentFire.latitude}
                                                <br/>
                                                <strong>Longitude: </strong>{this.state.currentFire.longitude}
                                                <br/>
                                                <strong>Year Of Occurance: </strong>{this.state.currentFire['date']}
                                                <br/>
                                                <strong>{this.state.currentFire['acres burned']}</strong>
                                                <br/>
                                            </div>
                                        }
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div>
                            {/* <ImageDetection /> */}
                            <WildfireDetection />
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default Monitoring;
