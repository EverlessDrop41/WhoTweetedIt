var express = require('express');
var router = express.Router();
var utils = require("../utils");
var https = require("https");

router.get('/', function(req, res){

  res.send(req.query.car);
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

router.get('/random_twitter', function(req, response) {
  var userA = req.query.userA;
  var userB = req.query.userB;

console.log(userA + " : " + userB);


  if (!userA || !userB) {
    response.send("ERROR");
    return;
  }

  var username = Math.random() >= 0.5 ? userA : userB;

  utils.GET_ACCESS_TOKEN(function (access_token) {
    var request = https.request({
      host: "api.twitter.com",
      path: "/1.1/statuses/user_timeline.json?screen_name=" + username + "&count=50",
      headers: {
        "Authorization": "Bearer " + access_token,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "GET",
    }, function(res) {
      res.setEncoding('utf8');
      var body = "";
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', () => {
        json_body = JSON.parse(body)
        var index = getRandomInt(0, json_body.length - 1)
        var tweet = json_body[index];

        if (tweet && tweet.text) {
          response.json({
            error: "tweet not found"
          });
        }

        response.json({
          user: username,
          tweet: tweet.text
        });
      })
    });
    request.on('error', function(e) {
      response.error(e);
    });
    request.end();
  }, function (error) {
    response.error(error);
  });
});

router.get('/access_token', function (req, res) {
  utils.GET_ACCESS_TOKEN(function(data) {
    res.send(data)
  }, function (e) {
    res.error("There was an error: \n\n" + e.Message);
  });
})

module.exports = router;
