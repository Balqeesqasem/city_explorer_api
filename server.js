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
 const city = req.query.city;
  const geoData = require('./data/geo.json');
  //console.log(geoData);
  const locationData = new Location(city,geoData);
  res.status(200).send(locationData);
});

server.get('/weather' ,(req,res)=>{
  const weatherData = require('./data/weather.json');
  let eachDayWeather = [];
  for (let i=0 ; i<weatherData.data.length ; i++){
    const weatherDataA = new Weather(weatherData.data[i]);
    eachDayWeather.push(weatherDataA);
  }

  res.status(200).send(eachDayWeather);
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
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}



function Weather (weatherData){
  //console.log(weatherData);
  this.time = weatherData.datetime;
  this.description = weatherData.weather.description;
}
