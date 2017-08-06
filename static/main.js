// Uncomment the next line and the last line in production.
// ! function () {
var socket = io();

var paintLayer = document.getElementById('paintLayer');
var p = paintLayer.getContext('2d');
var cursorLayer = document.getElementById('cursorLayer');
var c = cursorLayer.getContext('2d');

var resolution = 10000;

var viewport = {
	width: undefined,
	height: undefined
}

var cursor = {
	id: undefined,
	x: undefined,
	y: undefined,
	prev: {
		x: undefined,
		y: undefined
	},
	active: false,
	color: function () {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 3; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}(),
}

var width = 30;

function size() {
	viewport.width = window.innerWidth * devicePixelRatio;
	viewport.height = window.innerHeight * devicePixelRatio;

	paintLayer.width = viewport.width;
	paintLayer.height = viewport.height;
	cursorLayer.width = viewport.width;
	cursorLayer.height = viewport.height;
};
size();
window.addEventListener('resize', size);

cursorLayer.addEventListener('mousedown', start);
cursorLayer.addEventListener('mousemove', move);
cursorLayer.addEventListener('mouseup', stop);

function start(e) {
	cursor.active = true;
}

function move(e) {
	cursor.x = e.clientX * devicePixelRatio;
	cursor.y = e.clientY * devicePixelRatio;

	if (!cursor.prev.x || !cursor.prev.y) {
		cursor.prev.x = cursor.x;
		cursor.prev.y = cursor.y;
	}

	socket.emit('line', {
		cursor,
		viewportMajor: Math.max(window.innerWidth, window.innerHeight),
	});

	cursor.prev.x = cursor.x;
	cursor.prev.y = cursor.y;
}

function stop(e) {
	cursor.active = false;
}

function drawCursor(data) {
	c.clearRect(0, 0, cursorLayer.width, cursorLayer.height);
	c.beginPath();
	c.arc(data.x, data.y, width / 2, 0, 2 * Math.PI);
	c.lineWidth = data.active ? 10 : 2;
	c.strokeStyle = data.color;
	c.shadowColor = '#fff';
	c.shadowBlur = 5;
	c.stroke();
}

function drawLine(data) {
	// p.clearRect(0, 0, paintLayer.width, paintLayer.height);
	p.beginPath();
	p.moveTo(data.prev.x, data.prev.y);
	p.lineTo(data.x, data.y);
	p.lineWidth = width;
	p.strokeStyle = data.color;
	p.lineCap = 'round';
	p.stroke();
}

socket.on('line', function (msg) {
	console.log(msg);
	drawCursor(msg.cursor);
	if (msg.cursor.active) {
		drawLine(msg.cursor);
	}
});
// }();
