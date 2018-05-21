"use strict";

const router = require("express").Router();
var bodyParser = require("body-parser");
const api_key = require('../keys');
var fetch = require('node-fetch');
const wapp = require('../wapp');
const schemas = require('../schemas');
router

.get('/',function(req,res){
  res.json({message:'API'});
})
.get('/guess-tech/:url',function(req,res){
fetchML(req.params.url).then(data=>{
  var formatted_data = {
    cms:data.Results.output1.value.Values[0][data.Results.output1.value.Values[0].length-2],
    prob:(100-(200*data.Results.output1.value.Values[0][data.Results.output1.value.Values[0].length-1])).toFixed(2)
  }
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