const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const imageRoutes = require("./routes/imageRoutes");  
const colors = require('colors')

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/image", () => imageRoutes) 

if (process.env.NODE_ENV === 'production') {
  
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const connectDB = async () => {
  try {   
    mongoose.set('strictQuery',false);
    const conn = await mongoose.connect(process.env.MONGO_URI)      
    console.log(`Roman's MongoDB Connected! ${conn.connection.host}`.cyan.underline);
    console.log(`Server is up on port ${port}!`);  
  } catch (error) {
    console.log(error)    
    process.exit(1)
  }
}

connectDB();