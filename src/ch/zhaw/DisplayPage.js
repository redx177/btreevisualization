function DisplayPage(elements, parent, level, isOnBottomLevel) {
	this.elements = elements;
	this.parent = parent;
	this.level = level;
	this.isOnBottomLevel = isOnBottomLevel;

	this.links = [];
	this.coordinates = undefined;
}