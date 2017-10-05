! function () {
	var socket = io();

	var canvas = document.getElementById('canvas');
	var c = canvas.getContext('2d');
	var viewport = {};
	var width = 0.01;
	var active = false;

	var cursor = {
		id: undefined,
		x: undefined,
		y: undefined,
		prev: {
			x: undefined,
			y: undefined
		},
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

	canvas.width = canvasResolution;
	canvas.height = canvasResolution;

	function size() {
		viewport.width = innerWidth * devicePixelRatio;
		viewport.height = innerHeight * devicePixelRatio;

		viewport.major = Math.max(viewport.width, viewport.height);

		viewport.cssMajor = Math.max(innerWidth, innerHeight);

		canvas.style.width = viewport.cssMajor + 'px';
		canvas.style.height = viewport.cssMajor + 'px';

		if (innerWidth > innerHeight) {
			canvas.style.top = (viewport.cssMajor - innerHeight) / -2 + 'px';
			canvas.style.left = 0;
		} else {
			canvas.style.top = 0;
			canvas.style.left = (viewport.cssMajor - innerWidth) / -2 + 'px';
		}
	};
	size();
	window.addEventListener('resize', size);

	canvas.addEventListener('mousedown', start);
	canvas.addEventListener('mousemove', move);
	canvas.addEventListener('mouseup', stop);

	canvas.addEventListener('touchstart', start, { passive: true });
	canvas.addEventListener('touchmove', move, { passive: true });
	canvas.addEventListener('touchend', stop);
	canvas.addEventListener('touchcancel', stop);

	function start(e) {
		active = true;

		move(e)
	}

	function move(e) {
		var ev = e.touches ? e.touches[0] : e;

		cursor.x = Number((((ev.clientX - canvas.offsetLeft) / viewport.major) * devicePixelRatio).toFixed(3));
		cursor.y = Number((((ev.clientY - canvas.offsetTop) / viewport.major) * devicePixelRatio).toFixed(3));

		if (!cursor.prev.x || !cursor.prev.y) {
			cursor.prev.x = cursor.x;
			cursor.prev.y = cursor.y;
		}

		if (cursor.id && active) {
			socket.emit('cursor', cursor);
			draw.line(cursor);
		}

		cursor.prev.x = cursor.x;
		cursor.prev.y = cursor.y;
	}

	function stop(e) {
		active = false;
	}

	var draw = {
		line: function (data) {
			c.beginPath();
			c.moveTo(data.prev.x * canvasResolution, data.prev.y * canvasResolution);
			c.lineTo(data.x * canvasResolution, data.y * canvasResolution);
			c.lineWidth = width * canvasResolution;
			c.strokeStyle = data.color;
			c.lineCap = 'round';
			c.stroke();
		}
	}

	socket.on('cursor', function (msg) {
		if (msg.id != socket.id) {
			draw.line(msg);
		}
	});
}();


