const mongoose = require('mongoose');

require('dotenv').config();
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const dbName = process.env.DB_NAME;

const connectionString = `mongodb://${username}:${password}@${host}:27017/${dbName}`;

mongoose.connect(connectionString).then(
  () => { 
    console.log('MongoDB is connected'); 
  },
  err => { 
    console.log('Cannot connect to MongoDB', err); 
  }
);

module.exports = { mongoose, connectionString }
