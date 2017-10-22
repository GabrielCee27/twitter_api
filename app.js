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

const user_name = config.user_name;

var data_obj = {
  'friends': [], //users you follow
  'unfollowers': []
};

var fs = require('fs');
const dir_data = './user_data/' + user_name + '_data.json';

console.log("Set up complete.");
///////////////////////////////////////////////////////////////////////////////

function userObjConstructor(name, bool = null) {
  var obj = {
    'screen_name': name,
    'verified': bool
  };
  return obj;
};

//Returns JSON object from data file.
function getObjFromDataFile() {
  return JSON.parse(fs.readFileSync(dir_data, 'utf8'));
};

function writeToDataFile(data_obj, message = 'Data file updated') {
  fs.writeFile(dir_data, JSON.stringify(data_obj), function(err) {
    if (err)
      return console.log(err);

    console.log(message);
  });
};

function printDataFileToConsole(message = '') {
  console.log("Data file " + message + ":");
  console.log(fs.readFileSync(dir_data, 'utf8'));
};

//Creates a new file for user if there is none.
if (!fs.existsSync(dir_data)) {
  //initiate folder

  fs.writeFile(dir_data, JSON.stringify(data_obj), function(err) {
    if (err)
      return console.log(err);

    console.log("New data file created and initiated.");
    getFriendsIds(); //since the program is starting from scratch
  });

} else {
  console.log("Data file already exists.");

  //check if friends is populated
  var temp_obj = getObjFromDataFile();
  //printDataFileToConsole();

  if (temp_obj.friends.length > 0) {
    console.log("Data file, friends is populated.");
    data_obj.friends = temp_obj.friends;
    console.log("data_obj.friends updated");
    //console.log("data_obj: " + JSON.stringify(data_obj));

    if (temp_obj.unfollowers.length > 0) {

      console.log("Data file, unfollowers is populated");
      data_obj.unfollowers = temp_obj.unfollowers;
      console.log("data_obj.unfollowers updated.");

        if(temp_obj.unfollowers[0].verified != null){
          console.log("Already checked if verified.");
        }
        else{
          console.log("Not checked if verified.");
          getUsersLookup();
        }

    } else {
      console.log("Data files, unfollowers is not populated");
      getFriendships();
    }

  } else {
    console.log("Data file, friends is not populated.");
    getFriendsIds();
  }
}

//To get an array of friends of users you are following and updates data file
function getFriendsIds() {
  console.log("Getting friends...");
  client.get('friends/ids', function(error, tweets, response) {
    if (error) throw error;
    else { //callback

      var body = JSON.parse(response.body); //to make it workable
      updateFriendsWith(body.ids);
    }
  });
};

function updateFriendsWith(array) {
  data_obj.friends = array;
  console.log("data_obj.friends is updated with ids.");

  fs.writeFile(dir_data, JSON.stringify(data_obj), function(err) {
    if (err)
      return console.log(err);

    console.log('Data file updated with new friend ids.');
    getFriendships();
  });
};

//Friends should be populated
//getFriendships will populate database with names of users who don't follow back
function getFriendships() {
  console.log("Getting friendships...");

  //console.log("length: " + data_obj.friends.length);
  var loops = data_obj.friends.length / 100;

  for (var i = 0; i < loops; i++) {
    console.log("i: " + i);
    var param = {
      user_id: getArrayOfFriends(i).toString()
    };

    client.get('friendships/lookup', param, function(error, tweet, response) {
      if (error) {
        return console.log(error);
      } else {
        checkConnections(JSON.parse(response.body));
      }
    });
  }

  /* Testing
  var param = {
    user_id: getArrayOfFriends(0).toString()
  };

  var param = {
    user_id: "158414847,142839300"
  }

  client.get('friendships/lookup', param, function(error, tweet, response) {
    if (error){
      return console.log(error);
    }
    else {
      checkConnections(JSON.parse(response.body));
    }
  });
  */

};

//returns an array of 100 friend ids
function getArrayOfFriends(start) {
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
function checkConnections(body) {
  console.log("Checking connections...");

  var arr = [];

  for (var j = 0; j < body.length; j++) {
    var add = true;
    for (var k = 0; k < body[j].connections.length; k++) {
      if (body[j].connections[k] == 'followed_by') {
        add = false;
      }
    };

    if (add) {
      //console.log(body[j].screen_name + " does not follow back");
      arr.push(body[j].screen_name);
    }

  };
  //console.log("arr: " + arr);
  appendUnfollowers(arr); //sends an array of screen names that don't follow back
};

function appendUnfollowers(arr) {
  console.log("Appending unfollowers...");

  for (var i = 0; i < arr.length; i++) {
    data_obj.unfollowers.push(userObjConstructor(arr[i]));
  };
  //console.log("data_obj.unfollowers updated.");
  //console.log("data_obj: " + JSON.stringify(data_obj));

  //console.log("temp_obj.unfollowers: " + temp_obj.unfollowers);

  fs.writeFile(dir_data, JSON.stringify(data_obj), function(err) {
    if (err)
      return console.log(err);

    //console.log('Appended unfollowers to data file');
  });

};

function getUsersLookup(i=0) {
  console.log("Looking up users...");
  temp_obj = getObjFromDataFile();
  console.log("data file unfollowers length: " + temp_obj.unfollowers.length);

  console.log("Loop #: " + i);
  var param = {
    screen_name: getArrayOfUnfollowers(i).toString()
  };

  client.get('users/lookup', param, function(error, tweet, response) {
    if (error) {
      return console.log(error);
    } else {
      checkIfUserIsVerified(JSON.parse(response.body), i);

      if(i == (Math.floor(temp_obj.unfollowers.length / 100)) ){
        console.log("End of recursion.");
        writeToDataFile(data_obj);
      }
      else {
        getUsersLookup(i + 1);
      }
    }
  });
};

function getArrayOfUnfollowers(start) {
  var arr = [];
  var temp_obj = getObjFromDataFile();
  var length = temp_obj.unfollowers.length; //254

  for (var i = start * 100;
    (i < length) && (i < ((start * 100) + 100)); i++) {
    arr.push(temp_obj.unfollowers[i].screen_name);
  }

  console.log("array being sent: " + arr);
  console.log('arr.length: ' + arr.length);

  return arr;
};

function checkIfUserIsVerified(body, start) {
  console.log("Checking if verified...");

  var l = start * 100; //

  console.log("l: " + l);
  console.log("body.length" + body.length);

  for (var j = 0; j < body.length; j++) {
    if (body[j].verified == true) {
      console.log(body[j].screen_name + " is verified.");
      data_obj.unfollowers[l] = userObjConstructor(body[j].screen_name, true);
    } else {
      data_obj.unfollowers[l] = userObjConstructor(body[j].screen_name, false);
    }
    l += 1;
  };

  console.log("data_obj.unfollowers: " + JSON.stringify(data_obj.unfollowers));
  console.log("data_obj.unfollowers.length: " + data_obj.unfollowers.length);
};
