define([ "gmaps" ], function(gmap) {
	function Map($el, option) {
		// TODO: adapter type code needs for switch
		this.map = new google.maps.Map($($el).get(0), option);
	}
	;

	var PLACE_TYPES = ['establishment', 'street_address', 'postal_code'];

	Map.TYPE = "google";

	Map.VISIBLE_ZOOM = 7;
	Map.DEFAULT_AREA_ZOOM = 13;
	Map.DEFAULT_ATTRACTION_ZOOM = 16;

	Map.DEFAULT_MAPTYPE_ID = google.maps.MapTypeId.ROADMAP;

	Map.EVENT_IDLE = "idle";
	Map.EVENT_CLICK = "click";
	Map.EVENT_ZOOM_CHANGED = "zoom_changed";
	Map.EVENT_BOUND_CHANGED = "bounds_changed";

	Map.computeDistanceBetween = function(p1, p2) {
		return google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
	};

	Map.prototype.getMap = function() {
		return this.map;
	};

	Map.prototype.searchLocation = function(location, onOK, onFail) {
		new google.maps.Geocoder().geocode({
			'address' : location
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				onOK(results[0].geometry.location, results[0].formatted_address);
			} else {
				onFail && onFail();
			}
		});
	};

	Map.prototype.searchText = function(term, callback) {
    	this.placesService = this.placeService || new google.maps.places.PlacesService(this.map);
    	this.placesService.textSearch({
			query : term,
			types : PLACE_TYPES
		}, function(results, status) {
			var callbackStatus = status === google.maps.places.PlacesServiceStatus.OK ? "OK" : "error";
			callback.call(this, results, callbackStatus);
		});
	};

	Map.prototype.addMarker = function(marker) {
		marker.setMap(this.map);
	};

	Map.prototype.removeMarker = function(marker) {
		marker.setMap(null);
	};

	Map.prototype.getZoom = function() {
		return this.map.getZoom();
	};

	Map.prototype.setZoom = function(zoom) {
		this.map.setZoom(zoom);
	};

	Map.prototype.setCenter = function(point) {
		this.map.setCenter(point);
	};

	Map.prototype.addListener = function(callback) {
		if (arguments.length === 1 && typeof arguments[0] === "object") {
			for ( var event in arguments[0]) {
				google.maps.event.addListener(this.map, event, arguments[0][event]);
			}
		} else if (arguments.length === 2) {
			google.maps.event.addListener(this.map, arguments[0], arguments[1]);
		}
	};

	Map.prototype.addListenerOnce = function(callback) {
		if (arguments.length === 1 && typeof arguments[0] === "object") {
			for ( var event in arguments[0]) {
				google.maps.event.addListenerOnce(this.map, event, arguments[0][event]);
			}
		} else if (arguments.length === 2) {
			google.maps.event.addListenerOnce(this.map, arguments[0], arguments[1]);
		}
	};

	Map.prototype.trigger = function(event) {
		google.maps.event.trigger(this.map, event);
	};

	Map.prototype.diagonal = function() {
		return google.maps.geometry.spherical.computeDistanceBetween(this.map.getBounds().getSouthWest(), this.map
				.getBounds().getNorthEast());
	};

	Map.prototype.getSouthWestPoint = function() {
		return new google.maps.LatLng(this.map.getBounds().getSouthWest().lat(), this.map.getBounds().getSouthWest()
				.lng());
	};

	Map.prototype.getNorthEastPoint = function() {
		return new google.maps.LatLng(this.map.getBounds().getNorthEast().lat(), this.map.getBounds().getNorthEast()
				.lng());
	};
	
	Map.prototype.fitBounds = function(markers) {
    	var bounds = new google.maps.LatLngBounds();
    	for(var i = markers.length - 1; i >= 0; i--) {
			bounds.extend(markers[i].getPosition());
    	}
		
		this.map.fitBounds(bounds);
	};

	return Map;
});