const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/static'));

http.listen(process.env.PORT || 3000);

io.on('connect', function (socket) {
	console.log(socket.id, ' connected');

	socket.on('cursor', function (msg) {
		io.emit('cursor', msg);
	});

	socket.on('disconnect', function () {
		console.log(socket.id, ' disconnected');
	});
});
