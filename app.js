console.log("Staring Application");

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

var jsonfile = require('jsonfile');

//var config = require('./config'); //keys
var config = require('./config_dev');

var twitter = require('twitter');
var client = new twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token,
  access_token_secret: config.access_token_secret
});

var user_name = config.user_name;

var fs = require('fs');
var dir = './data/' + user_name;

//Creates a new directory for user if there is none
if(!fs.existsSync(dir)){
  fs.mkdirSync(dir);
};

//To get a list of ids of users you are following
function get_ids() {
  console.log("Getting ids...");
  client.get('friends/ids', function(error, tweets, response) {
    if (error) throw error;
    else { //callback

      var body = JSON.parse(response.body); //to make it workable
      var ids = body.ids;

      //console.log(ids);

      /*
      if the user's data base is empty
        run get_friendships

      else bring user to menu

      */
    }
  });
};

//get_ids();
