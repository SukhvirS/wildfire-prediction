import React from 'react';
import DetectionDetail from './DetectionDetail';

const DetectionList = ({ boxes, scores, classes }) => {
  const fires = [];

  if(scores.length == classes.length) {
    for(let i = 0; i<boxes.length; i++) {
      fires.push([boxes[i], scores[i], classes[i], i]);
    }
  }

  const renderedList = fires.map((fire) => {
    return (
      <DetectionDetail
        box={fire[0]}
        score={fire[1]}
        classification={fire[2]}
        key={fire[4]}
      />
    );
  });

return <div className="ui relaxed divided list">{renderedList}</div>
}

export default DetectionList;
