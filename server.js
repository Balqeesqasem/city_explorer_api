'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000 ;
const server = express();
// any one can go
server.use(cors());
server.listen(PORT , () => {
  console.log(`lestining to PORT  ${PORT}`);
});


server.get('/' , (req,res) =>{
  res.status(200).send('Hello');
});

server.get('/location' ,(req,res)=>{
  const geoData = require('./data/geo.json');
  //console.log(geoData);
  const city = req.query.city;
  const locationData = new Location(city,geoData);
  res.send(locationData);
});

server.use('*' ,(req,res) =>{
  res.status(404).send('404 ERROR');
}
);
server.use((error ,req,res) =>{
  res.status(500).send(error);
});

function Location (city,geoData){
  this.searchQuery = city ;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

