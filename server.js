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

server.use('*' ,(req,res) =>{
  res.status(404).send('404 ERROR');
}
);
server.use((error ,req,res) =>{
  res.status(500).send(error);
});



