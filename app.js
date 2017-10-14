
console.log("Setting up application...");


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

var data_obj = {
  'friends': [], //users you follow
  'unfollowers': []
};

var fs = require('fs');
var dir_data = './user_data/' + user_name + '_data.json';

console.log("Set up complete.");
///////////////////////////////////////////////////////////////////////////////

//Creates a new file for user if there is none.
if (!fs.existsSync(dir_data)) {
  //initiate folder
  fs.writeFile(dir_data, JSON.stringify(data_obj), function(err) {
    if (err)
      return console.log(err);

    console.log("New data file created and initiated.");
  });

  get_friends_ids(); //since the program is starting from scratch
} else {
  console.log("Data file already exists.");

  //check if friends is populated
  var temp_obj = load_data();
  //console.log(obj.friends.length);
  if (temp_obj.friends.length > 0) {
    console.log("Friends is not empty");
    data_obj.friends = temp_obj.friends;
    //console.log(data_obj.friends);
  } else {
    console.log("Friends is empty");
    get_friends_ids();
  }
}

//Returns JSON object from data file.
function load_data() {
  //returns an object from json file
  return JSON.parse(fs.readFileSync(dir_data, 'utf8'));
};

//Replaces populated or null friends with a new array
function update_friends(array) {
  //Do I need to carry over existing data for this function?

  var temp_obj = load_data();
  temp_obj.friends = array;

  fs.writeFile(dir_data, JSON.stringify(temp_obj), function(err) {
    if (err)
      return console.log(err);

    console.log('Data file updated with new friends');
  });
};

//To get an array of friends of users you are following and updates data file
function get_friends_ids() {
  console.log("Getting friends...");
  client.get('friends/ids', function(error, tweets, response) {
    if (error) throw error;
    else { //callback

      var body = JSON.parse(response.body); //to make it workable
      update_friends(body.ids);
    }
  });
};

//returns an array of 100 friend ids
function arr_of_friends(start) {
  var arr = [];
  var length = data_obj.friends.length;

  for (var i = start * 100;
    (i < length) && (i < ((start * 100) + 100)); i++) {
    arr.push(data_obj.friends[i]);
  }
  console.log('arr.length: ' + arr.length);

  return arr;
};


//if user does not follow back, append to unfollowers
function check_connections(body) {
  for (var j = 0; j < body.length; j++) {
    var add = true;
    for (var k = 0; k < body[j].connections.length; k++) {
      if (body[j].connections[k] == 'followed_by') {
        add = false;
        console.log(body[j].screen_name + " does follow back");
      }
    }

    if (add) {
      console.log(body[j].screen_name + " does not follow back");
    }
  }
};


//Friends should be populated
//get_friendships will populate database with names of users who don't follow back
function get_friendships() {
  console.log("Getting friendships...");

  console.log("length: " + data_obj.friends.length);
  var loops = data_obj.friends.length / 100;

  /*
  for (var i = 0; i < loops; i++) {
    console.log("i: " + i);
    arr_of_friends(i);
  }
  */

  /*
  var param = {
    user_id: arr_of_friends(0).toString()
  };
  */

  var param = {
    user_id: "158414847"
  }

  client.get('friendships/lookup', param, function(error, tweet, response) {
    if (error)
      return console.log(error);

    check_connections(JSON.parse(response.body));

  });


};

get_friendships();


function main_menu(){
  //1) Run get_friendships
    //needs to have friends

  console.log("");
  console.log("---------Menu---------");
  console.log("1) Get Friendships");
  //console.log("2) See unfollowers");
  //console.log("3) Get IDs");
  console.log("");
  console.log(":");

  //2) See unfollowers (unfollow menu)
    //needs to have unfollowers list

  //3) Run get friends (start all over)
};


/*
function run_it(){
  //if user's database is empty run get_friendships

  //else bring user to menu
};
*/
