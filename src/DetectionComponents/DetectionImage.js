import React from 'react';

const DetectionImage = ({url, isLoading}) => {

  if(!url && !isLoading) {
    return (
      <div>
        <div >
          <i ></i>
          <p >Please Upload Satellite Image</p>
        </div>
      </div>
    );
  }
  else if (isLoading) {
    return (
      <div><i ></i></div>
    );
  }
  else {
    return(
      <div>
        <img src={url} alt="fire prediction" width='100%'/>
      </div>
    );
  }
  // 
  
  
  
}

export default DetectionImage;