import React, {useState} from 'react';
import axios from 'axios';
import './Regular.scss';
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

  // CRAZY BIG FUNCTION:
  const fileUploadHandler = () => {
    const fd = new FormData();
    // vvv Here we append our file to the FormData Obj. We use the state's "file" here
    fd.append('image', file, file.name);  

    /* WHAT IS AXIOS FOR AGAIN? see mern gen. notes
       we then make a post request to axios using the form data as the body (2nd arg). The third arg. is the 
       optional "options" object. We use it to "listen" to certain events.Inside here, we listen for onUploadProgress 
       events. When they occur, we set our "progress" state value as a percentage value. WHERE DO THE "TOTAL" and 
       "LOADED" PROP.S COME FROM?? */
       axios
      .post(`/api/image/upload`, fd, {
        onUploadProgress: (progressEvent) => {
          setProgress((progressEvent.loaded / progressEvent.total) * 100);
          console.log(
            'upload progress: ',
            Math.round((progressEvent.loaded / progressEvent.total) * 100)    // we simply upload our progress to the console.
          );
        },
      })
      // JUDGEMENT: this runs after the post request completes (WHERE DOES "DATA" VAR COME FROM???):
      .then(({ data }) => {
        setImageId(data);     // we set state var "imageId" as our data
        setFile(null);
        setInputContainsFile(false);
        setCurrentlyUploading(false);   // all false since upload process is done. 
      })

      // REST OF THIS IS FOR ERROR HANDLING. This is just an example. I can make it handle ANY error I want it to.
      .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          const errMsg = err.response.data;     // why do we have to use "response" property?
          if (errMsg) {
            console.log(errMsg);
            alert(errMsg);
          }
        } else if (err.response.status === 500) {
          console.log('db error');
          alert('db error');
        } else {
          console.log('other error: ', err);
        }
        setInputContainsFile(false);
        setCurrentlyUploading(false);
      });
  };

  const handleClick = () => {   // used on line 48
    if (inputContainsFile) {    // we could've put "file" instead, but this is for clarity.
      setCurrentlyUploading(true);
      fileUploadHandler();      // send our file to the server.
    }
  };

  return (
    // SHOW IMAGES ON FRONTEND:
    <div className='regular'>
      <div className='image-section'>
        {imageId ? (      // IMAGEID IS ONE OF OUR STATE VARIABLES. If this var exists...
          <>
            <img
              className='image'
              src={`/api/image/${imageId}`}
              alt='regular version'
            />
            {/* vvv this link opens the image in a new window (target='_blank') */}
            <a className='link' href={`/api/image/${imageId}`} target='_blank'>   
              link
            </a>
          </>
        ) : (
          // if imageId (for our "regular" image) doesn't exist...
          <p className='nopic'>no regular version pic yet</p>     
        )}
      </div>

      {/* FILE FORM. TODO: EXPLAIN. */}
      <div className='inputcontainer'>
        {currentlyUploading ? (     // IF CURRENTLY LOADING, RENDER THE IMAGE. 
          <img
            src={LoadingDots}
            className='loadingdots'
            alt='upload in progress'
          />
        ) : (
          <>                        
            <input                    // OTHERWISE, RENDER THE INPUT & ITS LABEL 
              className='file-input'
              onChange={handleFile}
              type='file'
              name='file'
              id='file'
            />
            <label
              // THIS IS A "CONDITIONAL CLASS". ONLY TRUE IF "FILE" HAS A VALUE. 'file-selected' is scss.
              className={`inputlabel ${file && 'file-selected'}`}   
              htmlFor='file'        // "this is file b/c this links it to the input above ^^"
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