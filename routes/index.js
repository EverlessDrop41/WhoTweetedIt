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
  userA = userA.trim();
  var userB = req.query.userB;
  userB = userB.trim();

  console.log(userA + " : " + userB);


  if (!userA || !userB) {
    response.send("ERROR");
    return;
  }

  var username = Math.random() >= 0.5 ? userA : userB;

  utils.GET_ACCESS_TOKEN(function (access_token) {
    var request = https.request({
      host: "api.twitter.com",
      path: "/1.1/users/lookup.json?screen_name=" + userA + "," + userB,
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
        if (json_body.length !== 2) {
          response.json({error: "invalid names"})
        } else {
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
            var index = getRandomInt(0, json_body.length - 2)
            var tweet = json_body[index];

            if (tweet && tweet.text) {
              response.json({
                user: username,
                tweet: tweet.text
              });
            } else {
              console.log(json_body, access_token);
              response.json({
                error: "tweet not found"
              });
            }
          })
        });
        request.on('error', function(e) {
          response.error(e);
        });
        request.end();
      }
      })
    });
    request.on('error', function(e) {
      response.error(e);
    });
    request.end();


  }, function (error) {
    response.send(error);
  });
});

router.get('/access_token', function (req, res) {
  utils.GET_ACCESS_TOKEN(function(data) {
    res.send("ACCESS TOKEN: " + data)
  }, function (e) {
    res.send("There was an error: \n\n" + e.Message);
  });
})

module.exports = router;
