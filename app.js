console.log("Staring Application");

var config = require('./config'); //keys
//var config = require('./config_dev');

var twitter = require('twitter');

var client = new twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token,
  access_token_secret: config.access_token_secret
});
