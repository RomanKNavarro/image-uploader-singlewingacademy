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
  // what's up with these ^^? We had none in the Traversy app. 
});

let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {bucketName: 'images',});  // identical to my TM app's conn.
});

const storage = new GridFsStorage({
  url: mongoURI,
  options: { useUnifiedTopology: true },
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