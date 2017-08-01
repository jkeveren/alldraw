var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io');

app.use(express.static(__dirname + '/static'));

http.listen(process.env.PORT || 3000);
