var express = require('express')
var app = express()

var index_route = require("./routes/index");
app.use('/', express.static('templates'));
app.use('/api', index_route);
app.use('/static', express.static('static'));
var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Example app listening on port 3000!')
});
