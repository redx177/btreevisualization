function Page () {
	this.minElementCount = 1;
	this.maxElementCount = 2*this.minElementCount;
	this.elements = [];
	this.links = [];
	this.parent = undefined;

	/**
	 * Inserts the number n.
	 * @param n Number to insert.
	 */
	this.insert = function(n) {
		n = parseInt(n);
		if (this.hasChildren()) {
			this.insertOnChild(n);
		} else {
			this.insertHere(n);
			this.handleOverflow();
		}
	};

	/**
	 * Deletes the n lowest to the bottom.
	 * @param n Number to delete.
	 */
	this.delete = function(n) {
		n = parseInt(n);
		var page = this.find(n);
		if (page.isALeaf()) {
			page.deleteOnLeave(n);
			if (page.hasUnderflow()) {
				if (!page.handleLeaveUnderflowWithNeighbours(n)) {
					page.handleLeaveUnderflowByConcatenation(n)
				}
			}
		}
	};
	/**
	 * Finds the number n.
	 * It first goes to the buttom and then searches up.
	 *
	 * @param n Number to find.
	 * @returns {*} DisplayPage that contains the number n. If not found: undefined
	 */
	this.find = function(n) {
		var subPage;
		for (var i = 0; i < this.elements.length; i++) {
			if (this.links[i] != undefined) {
				subPage = this.links[i].find(n);
				if (subPage != undefined) {
					return subPage;
				}
			}

			if (this.elements[i] == n) {
				return this;
			}
		}
		if (this.links[this.elements.length] != undefined) {
			subPage = this.links[this.elements.length].find(n);
			if (subPage != undefined) {
				return subPage;
			}
		}

		return undefined;
	};

	this.deleteOnLeave = function (n) {
		var found = false;
		for (var i = 0; i < this.maxElementCount; i++) {
			var j = found ? i-1 : i;
			this.elements[j] = this.elements[i];

			if (this.elements[i] == n) {
				found = true;
			}
		}
		this.elements.pop();
	};

	this.insertOnChild = function (n) {
		var found = false;
		$(this.elements).each(function(key, value){
			if (n < value) {
				this.links[key].insert(n);
				found = true;
				return false;
			}
			return true;
		}.bind(this));

		if (!found) {
			this.links[this.links.length-1].insert(n);
		}
	};

	this.handleOverflow = function() {

		if (!this.hasOverflow()) return;

		var middle = parseInt(this.maxElementCount / 2);
		var middleValue = this.elements[middle];

		var left = this.createLeft(middle);
		var right = this.createRight(middle);

		// If this is the root, create new root element.
		if (this.parent == undefined) {
			var newParent = new Page();
			newParent.insert(middleValue);
			newParent.addLink(0, left);
			newParent.addLink(1, right);

			window.root = newParent;
			left.parent = newParent;
			right.parent = newParent;

		// Else add the middle element to the parent.
		} else {
			var newParentElements = [];
			var newParentLinks = [];
			var found = false;

			$(this.parent.elements).each(function (key, value) {
				if (!found && middleValue < value) {
					newParentElements.push(middleValue);
					newParentLinks.push(left);
					newParentLinks.push(right);
					found = true;
				}
				newParentElements.push(value);
				newParentLinks.push(this.parent.links[(found ? key + 1 : key)]);
			}.bind(this));

			if (!found) {
				newParentElements.push(middleValue);
				var i = newParentElements.length;
				newParentLinks[i - 1] = left;
				newParentLinks[i] = right;
			}
			left.parent = this.parent;
			right.parent = this.parent;
			this.parent.elements = newParentElements;
			this.parent.links = newParentLinks;
			this.parent.handleOverflow();
		}
	};

	this.createLeft = function (middle) {
		var left = new Page();
		for (var i = 0; i < middle; i++) {
			left.elements[i] = this.elements[i];
			if (this.links[i] != undefined) {
				left.links[i] = this.links[i];
				left.links[i].parent = left;
			}
		}
		if (this.links[middle] != undefined) {
			left.links[middle] = this.links[middle];
			left.links[middle].parent = left;
		}
		return left;
	};

	this.createRight = function (middle) {
		var right = new Page();
		var j = 0;
		for (var i = middle + 1; i < this.maxElementCount + 1; i++) {
			right.elements[j] = this.elements[i];
			if (this.links[i] != undefined) {
				right.links[j] = this.links[i];
				right.links[j].parent = right;
			}
			j++;
		}
		if (this.links[this.maxElementCount+1] != undefined) {
			right.links[j] = this.links[this.maxElementCount+1];
			right.links[j].parent = right;
		}
		return right;
	};

	this.getLeftNeighbour = function (n) {
		for (var i = 0; i < this.elements.length; i++) {
			if (this.elements[i] < n) {
				return this.links[i];
			}
		}
		return undefined;
	};

	this.getRightNeighbour = function (n) {
		for (var i = 0; i < this.elements.length; i++) {
			if (this.elements[i] > n) {
				return this.links[i+1];
			}
		}
		return undefined;
	};

	this.getLeftIndexOnParent = function(n) {
		for (var i = 0; i < this.parent.elements.length; i++) {
			if (this.parent.elements[i] > n) {
				return i;
			}
		}
		return undefined;
	}

	this.getRightIndexOnParent = function(n) {
		for (i = this.parent.elements.length-1; i >= 0; i--) {
			if (this.parent.elements[i] < n) {
				return i;
			}
		}
		return undefined;
	}

	this.handleLeaveUnderflowWithNeighbours = function (n) {
		var elementForParent;
		var elementToPullFromParent;

		// Check if an element from the left neighbour can be stolen.
		var neighbour = this.parent.getLeftNeighbour(n);
		if (neighbour != undefined && neighbour.elements.length > this.minElementCount) {
			elementForParent = neighbour.elements[neighbour.elements.length-1];
			elementToPullFromParent = this.getLeftIndexOnParent(elementForParent);
		} else {
			// Check if an element from the right neighbour can be stolen.
			neighbour = this.parent.getRightNeighbour(n);
			if (neighbour != undefined && neighbour.elements.length > this.minElementCount) {
				elementForParent = neighbour.elements[0];
				elementToPullFromParent = this.getRightIndexOnParent(elementForParent);

			} else {
				// No excessive elements on neighbours available.
				return false;
			}
		}

		var elementForMe = this.parent.elements[elementToPullFromParent];
		neighbour.delete(elementForParent);
		this.parent.elements[elementToPullFromParent] = elementForParent;
		this.insert(elementForMe);

		return true;
	};

	this.handleLeaveUnderflowByConcatenation = function (n) {
		var elementToPullFromParent = 0;
		var neighbourToMerge;

		// Concatenate with right neighbour.
		if (this.parent.elements[0] < n) {
			neighbourToMerge = this.getRightNeighbour(n);
			elementToPullFromParent

		// Concatenate with left neighbour.
		} else {
			neighbourToMerge = this.getLeftNeighbour(n);

		}


	};

	this.insertHere = function (n) {
		this.elements.push(n);
		this.elements.sort(function(a,b){return a-b});
	};

	this.addLink = function (position, page) {
		this.links[position] = page;
	};

	this.hasChildren = function () {
		return this.links.length > 0;
	};

	this.hasOverflow = function () {
		return this.elements.length > this.maxElementCount;
	};

	this.hasUnderflow = function () {
		return this.elements.length < this.minElementCount;
	};

	this.isALeaf = function() {
		return this.links.length == 0;
	}
}
