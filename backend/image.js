// sends back the id of the uploaded image, so the front-end can
// display the uploaded image and a link to open it in a new tab

const mongoose = require('mongoose');
const GridFsStorage = require('multer-gridfs-storage');
const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();     // here's how we access our env file lol

const mongoURI = process.env.MONGO_URI;

const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
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
  cb('filetype'); // otherwise, return the error function with 'filetype' as arg.  
}