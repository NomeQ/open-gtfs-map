function Route(fields) {
	this.fields = fields;
	this.trips = {};
	this.shapes = [];
	
	this.getColor = function() {
		return this.fields['route_color'];
	}
	
	this.getIdName = function() {
		return 'rte-' + this.fields['route_short_name'];
	}
	
	this.getCombinedName = function() {
		return this.fields['route_short_name'] + ' - ' + this.fields['route_long_name'];
	}
	
	// TODO: Use a more sophisticated method to combine trips
	this.getBestTrip = function() {
		var best_len = 0;
		var best_id = 0;
		for ( var trip_id in this.trips ) {
			if (this.trips[trip_id].length > best_len) {
				best_len = this.trips[trip_id].length;
				best_id = trip_id;
			}
		}
		return this.trips[best_id];
	}
}

module.exports = Route;