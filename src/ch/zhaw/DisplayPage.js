function DisplayPage(elements, parent, level) {
	this.elements = elements;
	this.parent = parent;
	this.level = level;

	this.links = [];
	this.coordinates = undefined;

	this.isALeaf = function() {
		return this.links.length == 0;
	}
}