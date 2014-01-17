function Page () {
	this.maxElementCount = 2;
	this.elements = [];
	this.links = [];
	this.parent = undefined;

	this.insert = function(n) {
		if (this.hasChildren()) {
			this.insertOnChild(n);
		} else {
			this.insertHere(n);
		}
	};

	this.insertOnChild = function (n) {
		var found = false;
		$(this.elements).each(function(key, value){
			if (n < value) {
				this.links[key].insert(n);
				found = true;
				return false;
			}
		}.bind(this));

		if (!found) {
			this.links[this.links.length-1].insert(n);
		}
	};

	this.handleOverflow = function() {

		if (!this.hasOverflow()) return;

		var middle = parseInt(this.maxElementCount / 2);

		var left = new Page();
		for (var i=0; i < middle; i++) {
			left.insert(this.elements[i]);
		}

		var right = new Page();
		for (var i=middle+1; i < this.maxElementCount+1; i++) {
			right.insert(this.elements[i]);
		}

		// If this is the root, create new root element.
		if (this.parent == undefined) {
			var newParent = new Page();
			newParent.insert(this.elements[middle])
			newParent.addLink(0, left);
			newParent.addLink(1, right);

			window.root = newParent;
			left.setParent(newParent);
			right.setParent(newParent);

		// Else add the middle element to the parent.
		} /*else {
			var newParentElements = [];
			var newParentLinks = []
			$(this.parent.elements).each(function(key, value))
		}*/
	}

	this.insertHere = function (n) {
		this.elements.push(n);
		this.elements.sort(function(a,b){return a-b});
		this.handleOverflow();
	}

	this.addLink = function (position, page) {
		this.links[position] = page;
	};

	this.hasChildren = function () {
		return this.links.length > 0;
	};

	this.hasOverflow = function () {
		return this.elements.length == this.maxElementCount+1;
	}

	this.setParent = function (parent) {
		this.parent = parent;
	};
}
