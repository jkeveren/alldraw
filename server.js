'use strict';

console.log('MassDraw');

const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/static'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'index.html'))
});

http.listen(process.env.PORT || 3000);

io.on('connect', function (socket) {

	socket.on('cursor', function (msg) {
		io.emit('cursor', msg);
	});

});
