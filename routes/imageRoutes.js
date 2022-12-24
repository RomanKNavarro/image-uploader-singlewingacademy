// sends back the id of the uploaded image, so the front-end can
// display the uploaded image and a link to open it in a new tab

const mongoose = require('mongoose');
const {GridFsStorage} = require('multer-gridfs-storage');
const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();     // here's how we access our env file lol

const mongoURI = process.env.MONGO_URI;

const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
  //useCreateIndex: true,
  // what's up with these ^^? We had none in the Traversy app. These are "connection options". See notes. 
});

let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {bucketName: 'images',});  // identical to my TM app's conn.
});

const storage = new GridFsStorage({
  url: mongoURI,
  options: { useUnifiedTopology: true },    
  // AGAIN: WHAT IS useUnifiedTopology? Other than this, "storage" is identical to mine.
  file: (req, file) => {
    // this function runs every time a new file is created
    return new Promise((resolve, reject) => {
      // use the crypto package to generate some random hex bytes
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        // turn the random bytes into a string and add the file extention at the end of it (.png or .jpg)
        // this way our file names will not collide if someone uploads the same file twice
        const filename = buf.toString('hex') + path.extname(file.originalname);
        /* ME: What exactly is this string combination? 16 random bytes (which replace the filename), 
        plus the file's extension (eg: .txt) */
        const fileInfo = {
          filename: filename,
          bucketName: 'images',
        };
        // resolve these properties so they will be added to the new file document
        resolve(fileInfo);
      });
    });
  },
});

// set up our multer to use the gridfs storage defined above
const store = multer({
  storage,
  // limit the size to 20mb for any files coming in
  limits: { fileSize: 20000000 },

  // filter out invalid filetypes:
  // Set this to a function to control which files should be uploaded and which should be skipped. The function should look like this:
  // function fileFilter (req, file, cb). The function should call `cb` with a boolean to indicate if the file should be accepted
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);  // custom func. 
  },
}); // SUPER EASY ^^. "limits" and "fileFilter" (args: req, file, cb) are optional

// MINE: Set multer storage engine to the newly created object
// const upload = multer({ storage });

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;   // REGEX FOR ACCEPTABLE FILE TYPES
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // what is path.extname()? to get the extension of the given filename. What "extname" is is straightforward (extension)
  const mimetype = filetypes.test(file.mimetype);
  /* what's the mimetype again?? forgot exactly, but here, if the extname and mimetype pass the regex test, 
  then we return "null" for the error, and "true" b/c it passed our filter */
  if (mimetype && extname) return cb(null, true); 
  cb('filetype'); // otherwise, return the error function with 'filetype' as arg (this is for if the file is of any other extension (see below)).  
}

// we use the multer storage defined on line 55 ("store") to create A middleware, wrapped in the "uploadMiddleware" func. 
// This is to handle errors and send different responses. We had nothing like in this in TM's app. 
const uploadMiddleware = (req, res, next) => {
  const upload = store.single('image');
  upload(req, res, function (err) {   // how is "upload" being used as a func?
    if (err instanceof multer.MulterError) { // if file is too large...
      return res.status(400).send('File too large');
    } else if (err) {
      // check if our filetype error occurred. THIS ERROR DEFINED BY "cb('filetype');" (line 79)
      if (err === 'filetype') return res.status(400).send('Image files only');
      // An unknown error occurred when uploading.
      return res.sendStatus(500);
    }
    // all good, proceed. What happens "next"? "We continue to the next part of the express route" (and what is that?)
    next();
  });
};

// HERE IS THE POST ROUTE ITSELF LOOOOOOL. Handles incoming files using our upload middleware:
router.post('/upload/', uploadMiddleware, async (req, res) => {
  const { file } = req; // get the .file property from req that was added by the upload middleware
  const { id } = file;  // and the id of that new image file. EASY.

  // IN CASE MULTER.MULTERERROR() (LINE 87) WASN'T ENOUGH: we can set other, smaller file size limits on routes that use the 
  // upload middleware. Set this and the multer file size limit to whatever fits your project
  if (file.size > 5000000) {
    // if the file is too large, delete it and send an error
    deleteImage(id);  // NOT ANOTHER ROUTE. Just a simple custom func vvv. We pass it file.id (obtained above)
    return res.status(400).send('file may not exceed 5mb');
  }
  console.log('uploaded file: ', file);
  return res.send(file.id);
});

const deleteImage = (id) => {
  if (!id || id === 'undefined') return res.status(400).send('no image id');
  const _id = new mongoose.Types.ObjectId(id);    // make a mongoose id from "id".
  gfs.delete(_id, (err) => {
    if (err) return res.status(500).send('image deletion error'); // delete the image. If there's an error deleting, run callback func.
  });
};
// TM'S APP ALSO USED mongoose.Types.ObjectId() for deleting.


// route to access individual images.
// this route will be accessed by any img tags on the front end which have
// src tags like:
// <img src="/api/image/123456789" alt="example"/>
// <img src={`/api/image/${user.profilePic}`} alt="example"/>
router.get('/:id', ({ params: { id } }, res) => {       // ME: INSTEAD OF ({ params: { id } }, res), TM's IS JUST (req, res). WHY??
  // if no id return error
  if (!id || id === 'undefined') return res.status(400).send('no image id');
  // if there is an id string, cast it to mongoose's objectId type
  const _id = new mongoose.Types.ObjectId(id);
  // search for the image by id
  gfs.find({ _id }).toArray((err, files) => {           // TM'S ALSO USES GFS.FIND(). This checks if files requested by user exist 
    if (!files || files.length === 0)
      return res.status(400).send('no files exist');
    // if a file exists, send the data
    gfs.openDownloadStream(_id).pipe(res);      
    // Stream func gives us our "data stream". ".pipe(res)" sends the data to user who sent the request.
  });
});
// TM'S APP DID NOT use mongoose.Types.ObjectId() for getting.









