var express = require('express')
var app = express()

var index_route = require("./routes/index");
app.use('/', index_route);

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Example app listening on port 3000!')
});
