import React from 'react';
import {Link} from 'react-router-dom';
import '../css/MyNavbar.css';

const devUrl = '';
const prodUrl = 'https://wildfire-ml-flask.herokuapp.com';

class MyNavbar extends React.Component{
    render(){        
        var url = window.location.href;

        return(
            <div className="d-flex" id="wrapper">
            <div className="bg-light border-right" id="sidebar-wrapper">
                <div className="sidebar-heading">
                    <img src='https://upload.wikimedia.org/wikipedia/en/thumb/e/ec/San_Jose_State_Spartans_logo.svg/1200px-San_Jose_State_Spartans_logo.svg.png' alt='SJSU' width='40px' style={{margin:"0 16px 0 0"}}></img>
                    SJSU Wildfire 
                </div>
                <div className="list-group list-group-flush">
                    {
                        url.substr(url.length - 4).includes('com')?
                        <Link className='list-group-item list-group-item-action bg-light' to="/" style={{borderRight:'6px solid #3d3d3d'}} >Data Collection</Link>
                        :
                        <Link className='list-group-item list-group-item-action bg-light' to="/" >Data Collection</Link>
                    }
                    {
                        url.includes('preprocessing')?
                        <Link className='list-group-item list-group-item-action bg-light' to="/preprocessing" style={{borderRight:'6px solid #3d3d3d'}}>Preprocessing</Link>
                        :
                        <Link className='list-group-item list-group-item-action bg-light' to="/preprocessing">Preprocessing</Link>
                    }
                    {
                        url.includes('analysis')?
                        <Link className='list-group-item list-group-item-action bg-light' to="/data-analysis" style={{borderRight:'6px solid #3d3d3d'}} >Data Analysis</Link>
                        :
                        <Link className='list-group-item list-group-item-action bg-light' to="/data-analysis" >Data Analysis</Link>
                    }
                    {
                        url.includes('detection')?
                        <Link className='list-group-item list-group-item-action bg-light' to="/detection" style={{borderRight:'6px solid #3d3d3d'}}>Fire Monitoring / Detection</Link>
                        :
                        <Link className='list-group-item list-group-item-action bg-light' to="/detection">Fire Monitoring / Detection</Link>
                    }
                    {/* {
                        url.includes('imageDetection')?
                        <Link className='list-group-item list-group-item-action bg-light' to="/imageDetection" style={{borderRight:'6px solid #3d3d3d'}}>Fire Detection 2</Link>
                        :
                        <Link className='list-group-item list-group-item-action bg-light' to="/imageDetection">Fire Detection 2</Link>
                    } */}
                    {
                        url.includes('progression')?
                        <Link className='list-group-item list-group-item-action bg-light' to="/progression" style={{borderRight:'6px solid #3d3d3d'}}>Fire Progression</Link>
                        :
                        <Link className='list-group-item list-group-item-action bg-light' to="/progression">Fire Progression</Link>
                    }
                    {
                        url.includes('risk')?
                        <Link className='list-group-item list-group-item-action bg-light' to="/risk" style={{borderRight:'6px solid #3d3d3d'}}>Fire Risk Prediction</Link>
                        :
                        <Link className='list-group-item list-group-item-action bg-light' to="/risk">Fire Risk Prediction</Link>
                    }
                    {
                        url.includes('evaluation')?
                        <Link className='list-group-item list-group-item-action bg-light' to="/model-evaluation" style={{borderRight:'6px solid #3d3d3d'}}>Model Evaluation</Link>
                        :
                        <Link className='list-group-item list-group-item-action bg-light' to="/model-evaluation" >Model Evaluation</Link>
                    }
                    {/* {
                        url.includes('flask')?
                        <Link className='list-group-item list-group-item-action bg-light' to="/flask" style={{borderRight:'6px solid #3d3d3d'}}>Flask examples</Link>
                        :
                        <Link className='list-group-item list-group-item-action bg-light' to="/flask" >Flask examples</Link>
                    } */}
                </div>
            </div>
        </div>
        );
    }
}



export default MyNavbar;
