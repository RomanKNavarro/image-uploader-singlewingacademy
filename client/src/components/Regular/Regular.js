import React, {useState} from 'react';
import axios from 'axios';
import '.Regular.scss';
import LoadingDots from 'imgs/loading-dots.gif';

const Regular = () => {
  const [file, setFile] = useState(null);
  const [inputContainsFile, setInputContainsFile] = useState(false);
  const [currentlyUploading, setCurrentlyUploading] = useState(false);
  const [imageId, setImageId] = useState(null);
  const [progress, setProgress] = useState(null);     // SUPER STRAIGHTFORWARD

  // FUNCTIONS:
  const handleFile = (event) => {
    setFile(event.target.files[0]);   // FILE SET AS A STATE VALUE
    setInputContainsFile(true);       
  };

  return (
    <div>Regular</div>
  )
}
export default Regular