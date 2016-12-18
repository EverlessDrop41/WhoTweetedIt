var http = require('http');
var https = require('https');

var TWITTER_KEY = process.env.TWITTER_CONSUMER_KEY;
var TWITTER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

module.exports = {
  access_token: "",
  GET_KEY_AND_SECRET: function() {
    return TWITTER_KEY + ":" + TWITTER_SECRET;
  },
  GET_ENCODED_KEY_AND_SECRET: function() {
    return new Buffer(this.GET_KEY_AND_SECRET()).toString('base64')
  },
  GET_ACCESS_TOKEN: function(callback, errorCallback) {
    if (this.access_token == "") {
      var request = https.request({
        host: "api.twitter.com",
        path: "/oauth2/token?grant_type=client_credentials",
        headers: {
          "Authorization": "Basic " + this.GET_ENCODED_KEY_AND_SECRET(),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
      }, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
          var jsonObject = JSON.parse(data);
          this.access_token = jsonObject['access_token'];
          console.log(typeof callback)
          callback(this.access_token);
        });
      });
      request.on('error', function(e) {
        errorCallback(e);
      });
      request.end();

    } else {
      return callback(this.access_token);
    }
  }
}
