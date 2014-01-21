function Coordinates(x, y) {
	this.x = x;
	this.y = y;
}

function Painter() {

	this.maxElementCount;
	this.bottomLevelX = 20;

	this.paintRoot = function() {
		$("canvas").clearCanvas();
		this.paintPage(this.prepareTree(window.root, 0));
		//this.paintChildren(window.root, 0);
		this.bottomLevelX = 20;
	};

	this.clear = function() {
		$("canvas").clearCanvas();
		window.root = new Page();
	};

	this.paintPage = function (displayPage) {

		var coordinates = this.paintChildren(displayPage);

		if (displayPage.isALeaf()) {
			coordinates = new Coordinates(this.bottomLevelX, displayPage.level*60 + 20);
			this.bottomLevelX = this.bottomLevelX + 70;
		}

		$("canvas").drawImage({
			source: "bg"+this.maxElementCount+".jpg",
			x: coordinates.x, y: coordinates.y,
			width: 68*this.maxElementCount*0.5,
			height: 80*0.5,
			fromCenter: false
		});
		/*
		var width = 70;
		$("canvas").drawImage({
			source: "bg2-ghost.jpg",
			x: coordinates.x, y: coordinates.y,
			width: width,
			height: width / 5 * 2,
			fromCenter: false
		});
		*/
		displayPage.coordinates = new Coordinates(coordinates.x, coordinates.y);

		this.paintNumbers(displayPage);
		this.paintConnectors(displayPage);

		return coordinates;
	};

	this.paintChildren = function (displayPage) {

		var coordinates = undefined;
		var first = true;
		var minX = 0;
		$(displayPage.links).each(function (key, link) {
			coordinates = this.paintPage(link);
			if (first) {
				minX = coordinates.x;
				first = false;
			}
		}.bind(this));

		if (coordinates != undefined) {
			var maxX = coordinates.x+100;
			return new Coordinates(((maxX-minX)/2-30)+minX, (displayPage.level)*60+20);
		}

		return undefined;
	};

	this.paintNumbers = function(displayPage) {
		var x = displayPage.coordinates.x + 17;
		var y = displayPage.coordinates.y + 20;
		var offset = 31;

		$(displayPage.elements).each(function (key, value) {
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

	this.paintConnectors = function (displayPage) {
		var x = displayPage.coordinates.x + 3;
		var y = displayPage.coordinates.y + 37;
		var startOffset = 29;

		$(displayPage.links).each(function (key, link) {
			$('canvas').drawLine({
				strokeStyle: '#70c1ef',
				strokeWidth: 2,
				x1: x, y1: y,
				x2: link.coordinates.x+33, y2: link.coordinates.y+3
			});
			x = x + startOffset;
		});
	};

	this.prepareTree = function (page, level) {
		this.maxElementCount = page.maxElementCount;
		var displayPage = new DisplayPage(page.elements, page.parent, level);
		$(page.links).each(function(key, link) {
			displayPage.links.push(this.prepareTree(link, level+1));
		}.bind(this));

		return displayPage;
	};
}