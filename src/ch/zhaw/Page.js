function Page () {
	this.maxElementCount = 2;
	this.elements = [];
	this.links = [];
	this.parent = undefined;
	this.coordinates = undefined;

	this.insert = function(n) {
		n = parseInt(n);
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
		var middleValue = this.elements[middle];

		var left = new Page();
		for (var i=0; i < middle; i++) {
			left.elements[i] = this.elements[i];
			if (this.links[i] != undefined) {
				left.links[i] = this.links[i];
			}
		}
		if (this.links[middle] != undefined) {
			left.links[middle] = this.links[middle];
		}

		var right = new Page();
		var j = 0;
		for (var i=middle+1; i < this.maxElementCount+1; i++) {
			right.elements[j] = this.elements[i];
			if (this.links[i] != undefined) {
				right.links[j] = this.links[i];
			}
			j++;
		}
		if (this.links[this.maxElementCount] != undefined) {
			right.links[this.maxElementCount] = this.links[this.maxElementCount];
		}

		// If this is the root, create new root element.
		if (this.parent == undefined) {
			var newParent = new Page();
			newParent.insert(middleValue)
			newParent.addLink(0, left);
			newParent.addLink(1, right);

			window.root = newParent;
			left.setParent(newParent);
			right.setParent(newParent);

		// Else add the middle element to the parent.
		} else {
			var newParentElements = [];
			var newParentLinks = []
			var found = false;

			$(this.parent.elements).each(function(key, value) {
				if (!found && middleValue < value) {
					newParentElements.push(middleValue);
					newParentLinks.push(left);
					newParentLinks.push(right);
					found = true;
				}
				newParentElements.push(value);
				newParentLinks.push(this.parent.links[(found?key+1:key)]);
			}.bind(this));

			if (!found) {
				newParentElements.push(middleValue);
				i = newParentElements.length;
				newParentLinks[i-1] = left;
				newParentLinks[i] = right;
			}
			this.parent.elements = newParentElements;
			this.parent.links = newParentLinks;
			this.parent.handleOverflow();
		}
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
