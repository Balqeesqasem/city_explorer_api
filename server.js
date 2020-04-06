'use strict';

// Application Dependencies-----------------------------------------------------------------------
const express = require('express');
const cors = require('cors');
const superagent =require ('superagent');

// Load Environment Variables from the .env file--------------------------------------------------
require('dotenv').config();



//// Application Setup-----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000 ;
const server = express();
server.use(cors());




// Route Definitions for location--------------------------------------------------------------------
server.get('/location' ,locationHandler);

//request and send data
function locationHandler (req ,res){
  const city = req.query.city;
  getLocation(city)
    .then(locationData=> res.status(200).json(locationData));
}

// geting data
function getLocation (city) {
  let key = process.env.LOCATION_KEY ;
  const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json` ;
  //console.log(url);
  // const geoData = require('./data/geo.json');
  return superagent.get(url)
    .then(geoData => {
      const locationData = new LocationConst(city , geoData.body);
      return locationData;
    });

}
// Route Definitions for weather--------------------------------------------------------------------
server.get('/weather' ,weather);


//request and send data
function weather (req,res) {
  const city = req.query.search_query;
  getWeather(city)
    .then (weatherData => res.status(200).json(weatherData));
}

let eachDayWeather = [];
// geting data
function getWeather(city) {
  //console.log(city);
  let key = process.env.WHEATHER_KEY ;
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;
  return superagent.get(url)
    .then ( weatherData => {
      //console.log(weatherData.body);
      weatherData.body.data.forEach(val =>{
        var weatherData = new Weather(val);
        eachDayWeather.push(weatherData);
      });
      //console.log('weathr array',weatherData);
      //console.log('the emty array after',eachDayWeather);
      return eachDayWeather;
    });
}

// Route Definitions for trails--------------------------------------------------------------------
server.get('/trails' ,trail);

let trailArray= [];

function trail(req,res){
  const city = req.query.search_query;
  trailsGet(city)
    .then(trailData => res.status(200).json(trailData));
}
function trailsGet(){
  let key = process.env.TRAILS_KEY;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;
  return superagent.get(url)
    .then(trailData => {
      trailData.body.trails.forEach( val =>{
        var trailData = new Trails(val) ;
        trailArray.push(trailData);
      });
    });
}





// my constructer-------------------------------------------------------------------------------------
function LocationConst (city,geoData){
  this.search_query = city ;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}



function Weather (weatherData){
  //console.log(weatherData);
  this.time = weatherData.datetime;
  this.forecast = weatherData.weather.description;
}

function Trails (trailData){
  this.name=trailData.name;
  this.location=trailData.location;
  this.length=trailData.length;
  this.stars=trailData.stars;
  this.star_votes=trailData.starVotes;
  this.summary=trailData.summary;
  this.trail_url=trailData.url;
  this.conditions=trailData.conditionDetails;
  this.condition_date=trailData.conditionDate;
  //this.condition_time=trailData.
}

// error and 404 handling-------------------------------------------------------------------------------
server.use('*' ,(req,res) =>{
  res.status(404).send('404 ERROR');
}
);
server.use((error ,req,res) =>{
  res.status(500).send(error);
});


//Make sure the server is listening for requests-----------------------------------------------------------
server.listen(PORT , () => {
  console.log(`lestining to PORT  ${PORT}`);
});


// server.get('/' , (req,res) =>{
//   res.status(200).send('Hello');
// });
