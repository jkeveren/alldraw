var socket = io();

socket.on('test', function (msg) {
	console.log(socket.id);
});
