import React, {useState} from 'react';
// import axios from 'axios';
import './Regular.scss';
import LoadingDots from '../../imgs/loading-dots.gif';

const Regular = () => {
  const [file, setFile] = useState(null);
  const [inputContainsFile, setInputContainsFile] = useState(false);
  const [currentlyUploading, setCurrentlyUploading] = useState(false);
  // const [imageId, setImageId] = useState(null);
  // const [progress, setProgress] = useState(null);     

  // this will be our "unchanged event listener function"
  const handleFile = (event) => {
    setFile(event.target.files[0]);   
    setInputContainsFile(true);       
  };
  

  // HERE IS WHERE THE BUG IS:
  // const fileUploadHandler = () => {
  //   const fd = new FormData(); 
  //   fd.append('image', file, file.name);  

  //   // we make a post request to the server w/ axios...
  //   /* SO....this axios post request DOES send data, through ".post(`/api/image/upload`, fd,". Other than 
  //   that, it just gives the state properties different values */

  //   axios
  //   .post('/api/image/upload', fd, {
  //     onUploadProgress: (progressEvent) => {
  //       setProgress((progressEvent.loaded / progressEvent.total) * 100);
  //       console.log(
  //         'upload progress: ',
  //         Math.round((progressEvent.loaded / progressEvent.total) * 100)    
  //       );
  //     },
  //   })
    
  //   /* I UNDERSTAND WHERE WE GET "DATA": we get it from the response from the server (after making our post request).
  //   This response has a "data" property, which we destructure here. */
  //   .then(({ data }) => {   
  //     setImageId(data);     
  //     setFile(null);
  //     setInputContainsFile(false);
  //     setCurrentlyUploading(false);   
  //   })
    
  //   // ERROR HANDLING:
  //   .catch((err) => {
  //     console.log(err);
  //     if (err.response.status === 400) {
  //       const errMsg = err.response.data;     
  //       if (errMsg) {
  //         console.log(errMsg);
  //         alert(errMsg);
  //       }
  //     } else if (err.response.status === 500) {
  //       console.log('db error');
  //       alert('db error');
  //     } else {
  //       console.log('other error: ', err);
  //       setInputContainsFile(false);
  //       setCurrentlyUploading(false);
  //     }
  //   });
  // };

  // this is for the "submit" button
  const handleClick = () => {   
    if (inputContainsFile) {    
      setCurrentlyUploading(true);
      // fileUploadHandler();      
    }
  };

  return (
    <div className='regular'>
      {/* <div className='image-section'>
        {imageId ? (      
          <>
            <img
              className='image'
              src={`/api/image/${imageId}`}
              alt='regular version'
            />
            <a className='link' href={`/api/image/${imageId}`} target='_blank'>   
              link
            </a>
          </>
        ) : (
          
          <p className='nopic'>no regular version pic yet looooooool</p>     
        )}
      </div>  */}

      {/* FILE FORM. TODO: EXPLAIN. */}
      <div className='inputcontainer'>
        {currentlyUploading ? (     
          <img
            src={LoadingDots}
            className='loadingdots'
            alt='upload in progress'
          />
        ) : (
          <>                        
            {/* the "file-input" className hides the input (why would we wanna do that?) */}
            <input                    
              className='file-input' 
              onChange={handleFile}
              type='file'
              name='file'
              id='file'
            />
            <label      
              className={`inputlabel ${file && 'file-selected'}`}   
              htmlFor='file'        
              onClick={handleClick}
            >
              {file ? <>SUBMIT</> : <>REGULAR VERSION</>}   
              {/* if there's currently a "file", button says SUBMIT. Otherwise, REGULAR VERSION */}
            </label>
          </>
        )}
      </div>
    </div>
  )
}
export default Regular