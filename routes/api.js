"use strict";

const router = require("express").Router();
var bodyParser = require("body-parser");
const api_key = require('../keys');
var fetch = require('node-fetch');
const wapp = require('../wapp');
const schemas = require('../schemas');
var sanitizer = require('sanitizer');
router

.get('/',function(req,res){
  res.json({message:'API'});
})
.get('/guess-tech/:url',function(req,res){
  var url_string = sanitizer.sanitize(req.params.url);
fetchML(url_string).then(data=>{
  console.log(url_string);
  var probability=data.Results.output1.value.Values[0][data.Results.output1.value.Values[0].length-1];
  if(probability>0.5){
    probability = ((probability-0.5)/0.5)*100;
  }
  else {
    probability = (1-(probability/0.5))*100;
  }
  var formatted_data = {
    cms:data.Results.output1.value.Values[0][data.Results.output1.value.Values[0].length-2],
    prob:probability.toFixed(2)
  }
  var logged_data = {
    user_ip : req.connection.remoteAddress,
    cms: formatted_data.cms,
    prob: formatted_data.prob,
    url: url_string
  }
  console.log(logged_data);
  res.send(formatted_data);
})

});

var fetchML=function(url){
  return new Promise((res,rej)=> {
    wapp.getWapp('https://www.'+url).then(data=> {
      var body = JSON.stringify(buildBody(data));
      fetch('https://ussouthcentral.services.azureml.net/workspaces/8343fd3bbd2943f28f9a8a8b427ee59b/services/bee38cda04e549c393b72183c38f79cd/execute?api-version=2.0&details=true',{
        method:'POST',
        body: body,
        headers: { 'Content-Type': 'application/json','Authorization': 'Bearer '+api_key.microsoft_api},
    }).then(answer => answer.json())
    .then(json => res(json));
  })
  });
}


var findObjectInArray=function(array,name){
  for(var i = 0; i < array.length; i++) {
      if (array[i].name == name) {
          return i;
      }
  }
  return false;
}
var buildBody = function(data){
  var newScheme = schemas.body;
  var schemeI = 0;

  schemas.body.Inputs.input1.ColumnNames.forEach(tech=>{
    var index = findObjectInArray(data.applications,tech);
    var version;
    if(index!==false){
      version = data.applications[index].version;
    }
    else {
      version = 0;
    }
    var value;
    switch(version) {
      case 'UA':
      value = "-1";
      break;
      case "":
      value = "1";
      break;
      case 0:
      value = "0";
      break;
      default: 
      value = version.split('.').join("");
    }
    newScheme.Inputs.input1.Values[0][schemeI] = value;
    schemeI++;
  });
  return newScheme;
}

module.exports = router;