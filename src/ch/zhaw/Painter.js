function Coordinates(x, y) {
	this.x = x;
	this.y = y;
}

function Painter() {

	this.bottomLevelX = 20;
	this.treeDepth = 0;

	this.paintRoot = function() {
		$("canvas").clearCanvas();
		this.setTreeDepth();
		this.paintPage(window.root, 0, false);
	};

	this.paintPage = function (page, level, isBottomLevel) {

		var coordinates = this.paintChildren(page, level+1);

		if (isBottomLevel) {
			coordinates = new Coordinates(this.bottomLevelX, level*60 + 20);
			this.bottomLevelX = this.bottomLevelX + 100;
		}

		var width = 100;
		$("canvas").drawImage({
			source: "bg2-ghost.jpg",
			x: coordinates.x, y: coordinates.y,
			width: width,
			height: width / 5 * 2,
			fromCenter: false
		});
		page.coordinates = new Coordinates(coordinates.x, coordinates.y);

		this.paintNumbers(page);
		this.paintConnectors(page);

		return coordinates;
	};

	this.paintChildren = function (page, level) {

		var isBottomLevel = level == this.treeDepth;

		var coordinates = undefined;
		var first = true;
		var minX = 0;
		$(page.links).each(function (key, link) {
			coordinates = this.paintPage(link, level, isBottomLevel);
			if (first) {
				minX = coordinates.x;
				first = false;
			}
		}.bind(this));

		if (coordinates != undefined) {
			var maxX = coordinates.x+100;
			return new Coordinates(((maxX-minX)/2-30)+minX, (level-1)*60+20);
		}

		return undefined;
	};

	this.paintNumbers = function(page) {
		var x = page.coordinates.x + 15;
		var y = page.coordinates.y + 20;
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

	this.paintConnectors = function (page) {
		var x = page.coordinates.x + 3;
		var y = page.coordinates.y + 37;
		var startOffset = 29;

		$(page.links).each(function (key, link) {
			$('canvas').drawLine({
				strokeStyle: '#70c1ef',
				strokeWidth: 2,
				x1: x, y1: y,
				x2: link.coordinates.x+33, y2: link.coordinates.y+3
			});
			x = x + startOffset;
		});
	};

	this.setTreeDepth = function() {
		var p = window.root;
		for (this.treeDepth = 0; true; this.treeDepth++) {
			if (p.links.length == 0) break;
			p = p.links[0];
		}
	}
}