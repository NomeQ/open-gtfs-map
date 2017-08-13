var simplify = require('simplify-js');

function SVG() {
	this.height;
	this.width;
	this.scaleX;
	this.scaleY;
	
	this.groups = {};
	this.stops = {};
	this.legend = [];
	this.currGroup;
	
	this.setScale = function(lat, lon) {
		var shiftx = Math.min(...lat);
		var shifty = Math.min(...lon);
		var raw_height = Math.max(...lon) - shifty;
		var raw_width = Math.max(...lat) - shiftx;
		var scale_factor = 800 / raw_width;
		this.width = 800 * 1.3;
		this.height = raw_height * scale_factor * 1.3;
		this.scaleX = function(x_val) {
			return (x_val - shiftx) * scale_factor;
		}
		this.scaleY = function(y_val) {
			return (y_val - shifty) * scale_factor;
		} 
	}
	
	this.addRouteGroup = function(rname, color) {
		this.groups[rname] = {'name' : rname, 'color' : '#' + color, 'path' : []};
		this.currGroup = this.groups[rname]['path'];
	}
	
	this.addPoint = function(lat, lon, id) {
		this.currGroup.push({x : this.scaleX(lat), y: this.scaleY(lon), id: id});
	}
	
	this.simplifyPaths = function() {
		for (var group in this.groups) {
			g = this.groups[group];
			g.path = simplify(g.path, 11, true);
		}
	}
	
	this.addLegend = function(routes) {
		
	}
	
	this.getTransitionCoords = function(dist=10) {
		var stops = [];
		for (var group in this.groups) {
			g = this.groups[group].path;
			stops.push(g);
		}
		return stops;
	}
	
	this.export = function() {
		var html = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + this.width + ' ' + this.height + '">';
		html += '<g id="paths" transform="rotate(-90) translate(-850, 10)">' + this.drawPaths() + '</g>';
		html += '<g id="stops" transform="rotate(-90) translate(-850, 10)">' + this.drawStops() + '</g>';
		html += '</svg>';
		return html;
	}
	
	this.drawPaths = function() {
		var html = '';
		for (var group in this.groups) {
			g = this.groups[group];
			html += '<g id="'+ group + '" style="stroke:' + g['color'] + ';">';
			html += '<polyline points="';
			p = g['path'];
			for (var j = 0; j < p.length; j++) {
				html += p[j].x + ',' + p[j].y + ' ';
			}
			html += '" />';
			html += '</g>';
		}
		return html;
	}
	
	this.drawStops = function() {
		var html = '';
		for (var id in this.stops) {
			s = this.stops[id];
			html += '<circle cx="' + s.x + '" cy="' + s.y +'" r="10" class="stop-pt" />';
			html += '<text x="' + (s.x + 20) + '" y="' + (s.y + 20) +'" transform="rotate(90,' + s.x + ',' + s.y +')" font-size="20">' + s.name + '</text>';
		}
		return html;
	}
	
	this.drawLegend = function() {
		
	}
}

module.exports = SVG;