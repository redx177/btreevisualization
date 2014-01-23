function Page () {
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
			page.deleteHere(n);
			page.handleUnderflow(n);
		} else {
			page.deleteOnInnerNode(n);
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

	this.handleUnderflow = function(n) {
		if (this.hasUnderflow()) {
			if (!this.handleUnderflowWithNeighbours(n)) {
				this.handleUnderflowWithMerging(n)
			}
		}
	};

	this.deleteHere = function (n) {
		var found = false;
		for (var i = 0; i < this.elements.length+1; i++) {
			var j = found ? i-1 : i;
			this.elements[j] = this.elements[i];

			if (this.elements[i] == n) {
				found = true;
			}
		}
		//for (var i = window.painter.maxElementCount; i >=0; i--) {
		//	if (this.elements[i] == undefined) {
				this.elements.pop();
		//	}
		//}
	};

	this.deleteOnInnerNode = function (n) {
		var p = this.links[this.elements.indexOf(n)];
		while (p.links[p.links.length-1] != undefined) {
			p = p.links[p.links.length-1];
		}
		var nextLowerElementToN = p.elements[p.elements.length-1];
		for (var i = 0; i < this.elements.length; i++) {
			if (this.elements[i] == n) {
				this.elements[i] = nextLowerElementToN;
				break;
			}
		}
		this.delete(nextLowerElementToN);
	};

	this.removeElements = function (arr, toRemove) {
		if (arr.length > 0 && arr[arr.length-1] == toRemove) {
			arr.pop();
			return this.removeElements(arr, toRemove);
		}
		return arr;
	};

	this.deleteHereAndRemoveLink = function (n) {
		var pos = this.elements.indexOf(n);
		this.elements.splice(pos, 1);
		this.links.splice(pos, 1);
		return;

		var found = false;
		for (var i = 0; i < window.painter.maxElementCount; i++) {
			var j = found ? i-1 : i;
			this.elements[j] = this.elements[i];
			if (this.links[i] != undefined) {
				this.links[j] = this.links[i];
			}

			if (this.elements[i] == n) {
				found = true;
				if (i == this.elements.length-1) {
					this.elements.pop();
				}
			}
		}

		this.elements = this.removeElements(this.elements, undefined);

		if (this.links[window.painter.maxElementCount] != undefined) {
			this.links[window.painter.maxElementCount-1] = this.links[window.painter.maxElementCount];
		}
		//this.elements.pop();
		this.links.pop();
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

		var middle = parseInt(window.painter.maxElementCount / 2);
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
		for (var i = middle + 1; i < window.painter.maxElementCount + 1; i++) {
			right.elements[j] = this.elements[i];
			if (this.links[i] != undefined) {
				right.links[j] = this.links[i];
				right.links[j].parent = right;
			}
			j++;
		}
		if (this.links[window.painter.maxElementCount+1] != undefined) {
			right.links[j] = this.links[window.painter.maxElementCount+1];
			right.links[j].parent = right;
		}
		return right;
	};

	this.getLeftNeighbour = function (n) {
		for (var i = this.elements.length-1; i >= 0; i--) {
			if (this.elements[i] < n) {
				return this.links[i];
			}
		}
		return undefined;
	};

	this.getRightNeighbour = function (n) {
		for (var i = 0; i < this.elements.length; i++) {
			if (this.elements[i] >= n) {
				return this.links[i+1];
			}
		}
		return undefined;
	};

	this.getLeftIndexOnParent = function(n) {
		if (n > this.parent.elements[this.parent.elements.length-1]) {
			return this.parent.elements.length-1;
		}
		for (var i = 0; i < this.parent.elements.length; i++) {
			if (this.parent.elements[i] >= n) return i-1;
			//else return i;
			/*if (this.parent.elements[i] >= n) {
				return (i == 0) ? 0 : i-1;
			}*/
		}
		return undefined;
	};

	this.getRightIndexOnParent = function(n) {
		return this.getLeftIndexOnParent(n)+1;
		/*
		for (var i = this.parent.elements.length-1; i >= 0; i--) {
			if (this.parent.elements[i] <= n) {
				return i;
			}
		}
		return undefined;
		*/
	};

	this.handleUnderflowWithNeighbours = function (n) {
		var elementForParent;
		var elementToPullFromParent;
		//var stoleLeft;

		// Check if an element from the left neighbour can be stolen.
		var neighbour = this.parent.getLeftNeighbour(n);
		if (neighbour != undefined && neighbour.elements.length > window.painter.minElementCount) {
			elementForParent = neighbour.elements[neighbour.elements.length-1];
			elementToPullFromParent = this.getRightIndexOnParent(elementForParent);
			//stoleLeft = true;
		} else {
			// Check if an element from the right neighbour can be stolen.
			neighbour = this.parent.getRightNeighbour(n);
			if (neighbour != undefined && neighbour.elements.length > window.painter.minElementCount) {
				elementForParent = neighbour.elements[0];
				elementToPullFromParent = this.getLeftIndexOnParent(elementForParent);
				//stoleLeft = false;
			} else {
				// No excessive elements on neighbours available.
				return false;
			}
		}

		// Rotate
		// 1. Put node from neighbour to parent.
		// 2. Put node from parent to me.
		var elementForMe = this.parent.elements[elementToPullFromParent];
		neighbour.deleteHere(elementForParent);
		this.parent.elements[elementToPullFromParent] = elementForParent;
		this.insertHere(elementForMe);

		/*
		if (!this.isALeaf()) {
			if (stoleLeft) {
				var link = neighbour.links.pop();
				link.parent = this;
				this.links.unshift(link);
			} else {
				var link = neighbour.links.shift();
				link.parent = this;
				this.links.push(link);
			}
		}*/

		return true;
	};

	this.handleUnderflowWithMerging = function (n) {
		var neighbourToMerge = this.getNeighbourToMerge(n);
		var elementIndexToPullFromParent = this.getElementIndexToPullFromParent(n);

		var elementForMe = this.parent.elements[elementIndexToPullFromParent];
		this.parent.deleteHereAndRemoveLink(elementForMe);

		var mergedPage = this.rotate(neighbourToMerge, elementForMe, elementIndexToPullFromParent);

		if (mergedPage.parent.elements.length <= window.painter.minElementCount
			&& mergedPage.parent.parent == undefined && mergedPage.parent.elements.length == 0) {
			mergedPage.parent = undefined;
			window.root = mergedPage;
			return;
		}

		if (this.isALeaf()) {
			this.parent.fixAfterDelete(n);
		} else {
			this.fixLinksAfterRotate(mergedPage, neighbourToMerge);
		}
	};

	this.fixAfterDelete = function (n) {
		// Is there an error?

		//if (this.links.length > 0 && this.links.length <= window.painter.minElementCount) {
		if (this.elements.length < window.painter.minElementCount && this.parent != undefined) {
			// Can an element be stolen from the left sibling?
			var leftNeighbour = this.parent.getLeftNeighbour(n);
			if (leftNeighbour != undefined && leftNeighbour.elements.length > window.painter.minElementCount) {
				this.handleUnderflowWithNeighbours(n);
				this.links.unshift(leftNeighbour.links.pop());
				return;
			}

			// Can an element be stolen from the right sibling?
			var rightNeighbour = this.parent.getRightNeighbour(n);
			if (rightNeighbour != undefined && rightNeighbour.elements.length > window.painter.minElementCount) {
				this.handleUnderflowWithNeighbours(n);
				var p = rightNeighbour.links.shift();
				p.parent = this;
				this.links.push(p);
				return;
			}

			// Merge
			var neighbourToMerge = this.getNeighbourToMerge(n);

			var elementIndexToPullFromParent = this.getElementIndexToPullFromParent(n);
			var elementForMe = this.parent.elements[elementIndexToPullFromParent];

			this.parent.deleteHereAndRemoveLink(elementForMe);
			var mergedPage = this.rotate(neighbourToMerge, elementForMe, elementIndexToPullFromParent);

			this.fixLinksAfterRotate(mergedPage, neighbourToMerge);

			//this.parent.handleUnderflow(n);
		}
	};

	this.fixLinksAfterRotate = function (mergedPage, neighbourToMerge) {
		if (this.links[0].elements[0] < neighbourToMerge.links[0].elements[0]) {
			$(this.links).each(function(key, link) {
				mergedPage.links.push(link);
				link.parent = mergedPage;
			});

			$(neighbourToMerge.links).each(function(key, link) {
				mergedPage.links.push(link);
				link.parent = mergedPage;
			});
		} else {
			$(neighbourToMerge.links).each(function(key, link) {
				mergedPage.links.push(link);
				link.parent = mergedPage;
			});

			$(this.links).each(function(key, link) {
				mergedPage.links.push(link);
				link.parent = mergedPage;
			});
		}

		if (mergedPage.parent.elements.length <= window.painter.minElementCount
			&& mergedPage.parent.parent == undefined && mergedPage.parent.elements.length == 0) {

			mergedPage.parent = undefined;
			window.root = mergedPage;
			return;
		}
	};

	this.getNeighbourToMerge = function(n) {
		return (this.parent.elements[0] >= n) ? this.parent.getRightNeighbour(n) : this.parent.getLeftNeighbour(n);
	};

	this.getElementIndexToPullFromParent = function(n) {
		//return (this.parent.elements[0] > n) ? this.getLeftIndexOnParent(n) : this.getRightIndexOnParent(n);
		//return (this.parent.elements[0] == n) ? this.getRightIndexOnParent(n) : this.getLeftIndexOnParent(n);
		if (n > this.parent.elements[this.parent.elements.length-1]) {
			return this.parent.elements.length-1;
		}
		if (n <= this.parent.elements[0]) {
			return 0;
		}
		return (this.parent.elements[0] >= n) ? this.getRightIndexOnParent(n) : this.getLeftIndexOnParent(n);
	};

	this.rotate = function (neighbourToMerge, elementForMe, elementIndexToPullFromParent) {
		var mergedPage = new Page();
		$(this.elements).each(function (key, value) {
			mergedPage.insert(value);
		});
		$(neighbourToMerge.elements).each(function (key, value) {
			mergedPage.insert(value);
		});
		mergedPage.insert(elementForMe);
		mergedPage.parent = this.parent;

		this.parent.links[elementIndexToPullFromParent] = mergedPage;
		return mergedPage;
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
		return this.elements.length > window.painter.maxElementCount;
	};

	this.hasUnderflow = function () {
		return this.elements.length < window.painter.minElementCount;
	};

	this.isALeaf = function() {
		return this.links.length == 0;
	}
}
