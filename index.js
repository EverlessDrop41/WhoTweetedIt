var express = require('express')
var app = express()

var index_route = require("./routes/index");
app.use('/', index_route);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
