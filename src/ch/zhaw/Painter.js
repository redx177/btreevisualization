function Painter() {
	this.paintRoot = function() {
		$("canvas").clearCanvas();
		this.paintPage(150, 20, window.root);
	};

	this.paintPage = function(x, y, page) {
		var width = 100;
		$("canvas").drawImage({
			source: "bg2-ghost.jpg",
			x: x, y: y,
			width: width,
			height: width / 5 * 2,
			fromCenter: false
		});

		this.paintNumbers(x, y, page);
		this.paintChildren(x, y, page);
		this.paintConnectors(x, y, page);
	};

	this.paintNumbers = function(x, y, page) {
		x = x + 15;
		y = y + 20;
		var offset = 33;

		$(page.elements).each(function (key, value) {
			$('canvas').drawText({
				fillStyle: '#9cf',
				strokeStyle: '#25a',
				strokeWidth: 2,
				x: x, y: y,
				fontSize: 18,
				fontFamily: 'Verdana, sans-serif',
				text: value
			});
			x = x + offset;
		})
	};

	this.paintChildren = function (x, y, page) {
		x = x - 100;
		y = y + 60;
		var offset = 100;

		$(page.links).each(function (key, link) {
			window.painter.paintPage(x, y, link);
			x = x + offset;
		});
	};

	this.paintConnectors = function (x, y, page) {
		xStart = x + 3;
		yStart = y + 37;
		xEnd= x - 69;
		yEnd= y + 63;
		var startOffset = 29;
		var endOffset = 101;

		$(page.links).each(function (key, link) {
			$('canvas').drawLine({
				strokeStyle: '#70c1ef',
				strokeWidth: 2,
				x1: xStart, y1: yStart,
				x2: xEnd, y2: yEnd
			});
			xStart = xStart + startOffset;
			xEnd = xEnd + endOffset;
		});
	};
}