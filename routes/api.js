"use strict";

const router = require("express").Router();
var bodyParser = require("body-parser");
const api_key = require('../keys');
var fetch = require('node-fetch');

router

.get('/',function(req,res){
  res.json({message:'API'});
})


module.exports = router;