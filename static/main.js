// Uncomment the next line and the last line in production.
// ! function () {
var socket = io();

var resolution = Math.min(screen.width, screen.height) * 2; //yea use this method instead. //yea this looks whacky, it's like that in case of multiple monitor setups. Otherwise i would have just used Math.max()

var paintLayer = document.getElementById('paintLayer');
var p = paintLayer.getContext('2d');
var cursorLayer = document.getElementById('cursorLayer');
var c = cursorLayer.getContext('2d');
var backupScaler = document.getElementById('backupScaler');
var b = backupScaler.getContext('2d');

paintLayer.width = resolution;
paintLayer.height = resolution;

cursorLayer.width = resolution;
cursorLayer.height = resolution;

var viewport = {};
var width = 20;
var backup;

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
		var letters = '0123456789ABCDEF';// Remove to prevent super light colors.
		var color = '#';
		for (var i = 0; i < 3; i++) {
			color += letters[Math.floor(Math.random() * letters.length)];
		}
		return color;
	}(),
}

function backupPaint() {
	backupScaler.width = paintLayer.width;
	backupScaler.height = paintLayer.height;
	backup = p.getImageData(0, 0, paintLayer.width, paintLayer.height);
}
backupPaint();

function size() {
	viewport.width = window.innerWidth * devicePixelRatio;
	viewport.height = window.innerHeight * devicePixelRatio;

	viewport.major = Math.max(viewport.width, viewport.height);

	// paintLayer.width = viewport.major;
	// paintLayer.height = viewport.major;

	// cursorLayer.width = viewport.major;
	// cursorLayer.height = viewport.major;

	// var scale = (viewport.major / viewport.majorOld) || 1;

	// b.putImageData(backup, 0, 0);
	// p.save();
	// p.scale(scale, scale);
	// p.drawImage(backupScaler, 0, 0);
	// p.restore();

	// backupPaint();

	// viewport.majorOld = viewport.major;
};
size();
window.addEventListener('resize', size);

cursorLayer.addEventListener('mousedown', start);
cursorLayer.addEventListener('mousemove', move);
cursorLayer.addEventListener('mouseup', stop);

console.log(viewport.major);

function start(e) {
	cursor.active = true;
}

function move(e) {
	cursor.x = ((e.clientX * devicePixelRatio) - paintLayer.offsetLeft) / viewport.major * resolution;
	cursor.y = ((e.clientY * devicePixelRatio) - paintLayer.offsetTop) / viewport.major * resolution;

	if (!cursor.prev.x || !cursor.prev.y) {
		cursor.prev.x = cursor.x;
		cursor.prev.y = cursor.y;
	}

	socket.emit('cursor', {
		cursor,
		viewportMajor: viewport.major,
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
	c.arc(data.x, data.y, (width - 2) / 2, 0, 2 * Math.PI);
	c.lineWidth = 2;
	c.strokeStyle = data.color;
	c.shadowColor = '#fff';
	c.shadowBlur = 10;
	c.stroke();
}

socket.on('cursor', function (msg) {
	drawCursor(msg.cursor);
	if (msg.cursor.active) {
		p.beginPath();
		p.moveTo(msg.cursor.prev.x, msg.cursor.prev.y);
		p.lineTo(msg.cursor.x, msg.cursor.y);
		p.lineWidth = width;
		p.strokeStyle = msg.cursor.color;
		p.lineCap = 'round';
		p.stroke();
		// backupPaint();
	}
});
// }();
