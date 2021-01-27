import React from 'react';
import ReactDOM from 'react-dom';
import MyNavbar from './Components/MyNavbar';
import testImage from './DetectionComponents/test.jpeg';
import satImage from './DetectionComponents/satImage.jpeg';


class ImageDetection extends React.Component{
    constructor(){
        super();
        this.state = {
            selectedImage:null,
            mlImage:testImage,
            baseImage:satImage, 
        }
    }

    handleImageSubmit(event){
        var formData = new FormData();
        formData.append("file", event.target.files[0]);
        var selected = null;
        console.log(event.target.files[0]);
        if(event.target.files[0]!=null){
        selected = URL.createObjectURL(event.target.files[0]);
        }

        this.setState({selectedImage:selected, mlImage:null});

        fetch('https://wpp-fire-detection-ml.herokuapp.com/predict', {
            method: 'POST',
            body:formData
        })
        .then(response=>response.blob())
        .then(blob=>{
            var ml = URL.createObjectURL(blob);
            this.setState({mlImage:ml});
        })
        .catch(error => {
            console.log(error)
        })

    }
    
    
    render(){        

        return(
            <div>
                {/* <MyNavbar/> */}

                <div>

                    {/* <div style={{position:'fixed', backgroundColor:'#f8f9fa', height:"72px", width:"100%",  borderLeft:'1px solid #d9dadb', borderBottom:"1px solid #d9dadb", paddingLeft:"20px"}}>
                        <h1 className='mt-2'>Fire Detection 2</h1>
                    </div> */}

                    <div style={{position:'absolute', marginTop:'72px', zIndex:'-100'}}>

                        <div style={{margin:'10px 0 0 20px'}}>
                            <h3>Input a File to scanned.</h3>
                            <div style={{width:"100%"}}>
                            
                            <form encType="multipart/form-data" action="" style={{padding:10}}> 
                                    <input type="file" id="inputImage" onChange={this.handleImageSubmit.bind(this)}/>
                            </form>
                            </div>
                            <div>
                            {
                                    this.state.selectedImage == null?
                                    <div>
                                    <strong><p>Please Input an Image from above.</p></strong>
                                    <strong><p>Sample Image and Output</p></strong>
                                        <div>   
                                        <img src={this.state.baseImage} style={{width:500, height:'auto'}}/>
                                        <img src={this.state.mlImage} style={{width:500, height:'auto'}}/>
                                        </div>
                                    </div>
                                    :
                                    <div style={{width:'100%'}}>
                                    <img src={this.state.selectedImage} style={{width:500, height:'auto'}}></img>
                                    <img src={this.state.mlImage} style={{width:500, height:'auto'}}/>
                                    </div>
                                }
                            </div>           
                               </div>
                        </div>
                  </div>
            </div>
        );
    }
}

export default ImageDetection;
