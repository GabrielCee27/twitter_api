console.log("Staring Application");

//var config = require('./config'); //keys
var config = require('./config_dev');

var twitter = require('twitter');

var client = new twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token,
  access_token_secret: config.access_token_secret
});

//To get a list of ids of users you are following
function get_ids() {
  client.get('friends/ids', function(error, tweets, response) {
    if (error) throw error;
    else { //callback
      console.log("Getting ids...");

      var body = JSON.parse(response.body); //to make it workable
      var ids = body.ids;

      //console.log(ids);
    }
  });
};

//get_ids();
