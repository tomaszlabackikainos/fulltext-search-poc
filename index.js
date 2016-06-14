var express = require('express');
var app = express();
var httpPort = (process.argv[2] === undefined) ? 80 : process.argv[2];

// public, static files (frontend)
app.use(express.static('public'));

// api functionalities ("backend")
app.get('/api/', function (req, res) {
    res.send('Hello World!');
});

app.listen(httpPort, function () {
    console.log('http server started on port ' + httpPort);
});