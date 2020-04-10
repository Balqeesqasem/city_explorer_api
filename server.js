'use strict';


// Load Environment Variables from the .env file--------------------------------------------------
require('dotenv').config();
// Application Dependencies-----------------------------------------------------------------------
const express = require('express');
const cors = require('cors');
const superagent =require ('superagent');
const pg = require('pg'); //prepere connection between postgress and server (library)

//creat the connection our server now client ! connect server to database
const client = new pg.Client(process.env.DATABASE_URL);






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
  let SQL= 'SELECT * FROM place WHERE search_query=$1;';
  let safeValues = [city];
  return client.query(SQL,safeValues)
    .then(results =>{//tell js to wait
      //console.log('hiiiiiiiiiiiiiiiiiiii',Object.keys(results).length);
      if(results.rows.length){return results.rows[0];}

      else {
        let key = process.env.LOCATION_KEY ;
        const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json` ;
        return superagent.get(url)
          .then(geoData => {
            //console.log(geoData.body);
            const locationData = new LocationConst(city , geoData.body);
            let queryFor =locationData.formatted_query;
            let lat = locationData.latitude;
            let lon = locationData.longitude;
            //console.log('hiiiiiiiiiiiiii',locationData);
            let SQL = 'INSERT INTO place (search_query,formatted_query,latitude,longitude) VALUES ($1, $2, $3, $4);';
            let safeValues = [city,queryFor,lat,lon];
            return client.query(SQL,safeValues).then(results => {
              console.log('hiiiiiiiiiiiiiiiiiiii',results);
              return locationData;
            });
          });
      }
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


// geting data
function getWeather(city) {
  //console.log(city);
  let key = process.env.WHEATHER_KEY ;
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;
  return superagent.get(url)
    .then ( weatherData => {
      //console.log(weatherData.body);
      return weatherData.body.data.map(val =>{
        return new Weather(val);
      });

    });

}

// Route Definitions for trails--------------------------------------------------------------------
server.get('/trails' ,trail);

//let trailArray= [];

function trail(req,res){
  const city = req.query.search_query;
  const lat = req.query.latitude;
  const lon =req.query.longitude;
  trailsGet(city,lat,lon)
    .then(trailData => res.status(200).json(trailData));
}
function trailsGet(city,lat ,lon){
  let key = process.env.TRAILS_KEY;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${key}`;
  return superagent.get(url)
    .then(trailData => {
      console.log(trailData.body);
      return trailData.body.trails.map( val =>{
        return new Trails(val) ;
      });
    });
}

// Route Definitions for yelp--------------------------------------------------------------------
server.get('/yelp' ,yelp);

function yelp (req,res){
  const city = req.query.search_query;
  yelpGet(city)
    .then(yelpData => res.status(200).json(yelpData));
}

function yelpGet(city)
{
  let key = process.env.YELP_API_KEY;
  let url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
  return superagent.get(url)
    .set('Authorization',`Bearer ${key}`)
    .then(yelpData => {
      console.log(yelpData.body.businesses);
      return yelpData.body.businesses.map(val =>{
        return new Yelp(val);
      });
    });
}

// Route Definitions for yelp--------------------------------------------------------------------
server.get('/movies' ,movie);

function movie(req,res) {
  const city = req.query.search_query;
  movieGet(city)
    .then(movieData => res.status(200).json(movieData));

}

function movieGet(city){
  let key = process.env.MOVIE_API_KEY;
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;
  return superagent.get(url)
    .then(movieData =>{
      console.log(movieData.body);
      return movieData.body.results.map(val => {
        return new Movie(val);
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
  this.condition_date=trailData.conditionDate.slice(0,-9);
  this.condition_time=trailData.conditionDate.slice(-9);
}


function Yelp(yelpData){
  this.name = yelpData.name;
  this.image_url=yelpData.image_url;
  this.price=yelpData.price;
  this.rating=yelpData.rating;
  this.url=yelpData.url;
}

function Movie(movieData){
  this.title=movieData.title;
  this.overview=movieData.overview;
  this.average_votes=movieData.average_votes;
  this.total_votes=movieData.total_votes;
  this.image_url=`https://image.tmdb.org/t/p/w500${movieData.poster_path}`;
  this.popularity=movieData.popularity;
  this.released_on=movieData.released_on;
}

// error and 404 handling-------------------------------------------------------------------------------

server.use(error);
server.get('*', notFoundError);

function notFoundError(req,res){
  res.status(404).send('404 ERROR');
}


function error (req,res) {
  res.status(500).send(error);
}


//Make sure the server is listening for requests-----------------------------------------------------------

client.connect()//it's function (promese function so we should use .then) check connection of my database if it's connected go if not dont
  .then(() =>{
    server.listen(PORT , () => {
      console.log(`lestining to PORT  ${PORT}`);
    });
  });


