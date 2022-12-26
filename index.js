const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const imageRoutes = require("./routes/imageRoutes");  // get our image routes from this file. 
// const imageRoutes = require('./routes/image'); 

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// put your routes here
app.use("/api/image", () => imageRoutes) 
// any request from the frontend that gets sent to a route beginning with "/api/image" gets sent to imageRoutes.


// routes should begin with /api/
// since the front end proxies requests to any url beginning with /api/
// from port 3000 to port 8000 in development
// example route:
// app.post("/api/auth/register", (req, res) => {....})
//
// and in the front end:
// axios.post("/api/auth/register", {formData}).then(result=>{....}).catch(err=>{....})

// static file declaration
if (process.env.NODE_ENV === 'production') {
  // production mode
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// be sure to set your MONGO_URI in a .env file in both the root folder of your project
// and in the config variables section on Heroku, in the settings page for your app
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is up on port ${port}!`);
    });
  });