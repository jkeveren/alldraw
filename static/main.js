! function () {
	var socket = io();

	var paintLayer = document.getElementById('paintLayer');
	var p = paintLayer.getContext('2d');
	var cursorLayer = document.getElementById('cursorLayer');
	var c = cursorLayer.getContext('2d');
	var backupScaler = document.getElementById('backupScaler');
	var b = backupScaler.getContext('2d');
	var viewport = {};
	var width = 0.005;

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
				color += letters[Math.floor(Math.random() * letters.length)];
			}
			return color;
		}(),
	}

	socket.on('connect', function () {
		cursor.id = socket.id;
	})

	var canvasResolution = Math.min(screen.width, screen.height) * 2;

	paintLayer.width = canvasResolution;
	paintLayer.height = canvasResolution;

	cursorLayer.width = canvasResolution;
	cursorLayer.height = canvasResolution;


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
	};
	size();
	window.addEventListener('resize', size);

	cursorLayer.addEventListener('mousedown', start);
	cursorLayer.addEventListener('mousemove', move);
	cursorLayer.addEventListener('mouseup', stop);

	cursorLayer.addEventListener('touchstart', start, { passive: true });
	cursorLayer.addEventListener('touchmove', move, { passive: true });
	cursorLayer.addEventListener('touchend', stop);
	cursorLayer.addEventListener('touchcancel', stop);

	function start(e) {
		cursor.active = true;
		cursor.prev.x = cursor.x;
		cursor.prev.y = cursor.y;
		// cursorLayer.style.cursor = '-webkit-grabbing';
	}

	function move(e) {
		cursor.x = (((e.touches ? e.touches[0].clientX : e.clientX) * devicePixelRatio) - paintLayer.offsetLeft) / viewport.major;
		cursor.y = (((e.touches ? e.touches[0].clientY : e.clientY) * devicePixelRatio) - paintLayer.offsetTop) / viewport.major;

		if (!cursor.prev.x || !cursor.prev.y) {
			cursor.prev.x = cursor.x;
			cursor.prev.y = cursor.y;
		}

		if (cursor.id) {
			socket.emit('cursor', cursor);
			if (cursor.active) draw.line(cursor);
		}

		cursor.prev.x = cursor.x;
		cursor.prev.y = cursor.y;
	}

	function stop(e) {
		cursor.active = false;
		// cursorLayer.style.cursor = '-webkit-grab';
	}

	var draw = {
		cursor: function (data) {
			c.clearRect(0, 0, cursorLayer.width, cursorLayer.height);
			c.beginPath();
			c.arc(data.x * canvasResolution, data.y * canvasResolution, (width * canvasResolution - 2) / 2, 0, 2 * Math.PI);
			c.lineWidth = 0.001 * canvasResolution;
			c.fillStyle = data.color;
			c.fill();
		},
		line: function (data) {
			p.beginPath();
			p.moveTo(data.prev.x * canvasResolution, data.prev.y * canvasResolution);
			p.lineTo(data.x * canvasResolution, data.y * canvasResolution);
			p.lineWidth = width * canvasResolution;
			p.strokeStyle = data.color;
			p.lineCap = 'round';
			p.stroke();
		}
	}

	socket.on('cursor', function (msg) {
		if (msg.id != socket.id) {
			draw.cursor(msg);
			if (msg.active) draw.line(msg);
		}
	});
}();


