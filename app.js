console.log("Staring Application...");

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
var dir_file = './user_data/' + user_name;
var dir_data = dir_file + '/data.json';

var data = {
};

//Creates a new directory for user if there is none
if (!fs.existsSync(dir_file)) {
  fs.mkdirSync(dir_file);
  get_ids(); //since the program is starting from scratch
}
else{
  console.log('User file for ' + user_name + ' is already made.');
};

function update_data(obj){
  fs.writeFile(dir_data, JSON.stringify(obj), function(err){
      if(err)
        return console.log(err);

        console.log('File saved in ' + dir_data);
  });
};

//To get a list of ids of users you are following
function get_ids() {
  console.log("Getting ids...");
  client.get('friends/ids', function(error, tweets, response) {
    if (error) throw error;
    else { //callback

      var body = JSON.parse(response.body); //to make it workable
      data.ids = body.ids;
      //console.log(data.ids);

      update_data(data); //change to update_ids?

      //get_friendships
    }
  });
};

//get_ids();


function main_menu(){
  //1) Run get_friendships
    //needs to have IDs

  console.log("");
  console.log("---------Menu---------");
  console.log("1) Get Friendships");
  //console.log("2) See unfollowers");
  //console.log("3) Get IDs");
  console.log("");
  console.log(":");

  //2) See unfollowers (unfollow menu)
    //needs to have unfollowers list

  //3) Run get IDs (start all over)
};

main_menu();

/*
function run_it(){
  //if user's database is empty run get_friendships

  //else bring user to menu
};
*/
