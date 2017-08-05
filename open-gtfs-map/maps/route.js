function Route(id, route_name, color, text_color) {
	this.id = id;
	this.name = route_name;
	this.color = color;
	this.text_color = text_color;
	this.shapes = [];
	
}

module.exports = Route;