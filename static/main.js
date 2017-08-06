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
	x: undefined,
	y: undefined,
	prev: {
		x: undefined,
		y: undefined
	},
	active: false,
	color: '#f00'
}

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
		x: cursor.x,
		y: cursor.y,
		prev: {
			x: cursor.prev.x,
			y: cursor.prev.y
		},
		viewportMajor: Math.max(window.innerWidth, window.innerHeight),
		active: cursor.active
	});

	cursor.prev.x = cursor.x;
	cursor.prev.y = cursor.y;
}

function stop(e) {
	cursor.active = false;
}

function drawCursor(x, y, active = false) {
	if (x || y) {
		c.clearRect(0, 0, cursorLayer.width, cursorLayer.height);
		c.beginPath();
		c.arc(x, y, 30, 0, 2 * Math.PI);
		c.lineWidth = active ? 10 : 2;
		c.strokeStyle = cursor.color;
		c.shadowColor = '#fff';
		c.shadowBlur = 5;
		c.stroke();
	} else {
		console.log('nope');
	}
}

socket.on('line', function (msg) {
	console.log(msg);
	drawCursor(msg.x, msg.y, msg.active ? true : false);
});
// }();
