define([ "bmaps", "gmaps" ], function(bmap, gmap) {
	function Map($el, option) {
		// TODO: adapter type code needs for switch
		var mergedOption = $.extend({
			credentials : 'Avkup3PNjfssjhCDMjaSN2BjMr2Y7eQWTQnipafyF4hSoS5VjOBMhm8cRuIayV6a',
			showBreadcrumb : false,
			showCopyright: false,
			showDashboard: false,
			showMapTypeSelector: false,
			showScalebar: true
		}, option);
		$el.css("position", "relative");
		this.map = new Microsoft.Maps.Map($el.get(0), mergedOption);
	}
	;

	var EVENT_THRESHOLD = 1600;
	
	var PLACE_TYPES = ['establishment', 'street_address', 'postal_code'];

	Map.TYPE = "bing";

	Map.VISIBLE_ZOOM = 8;
	Map.DEFAULT_AREA_ZOOM = 13;
	Map.DEFAULT_ATTRACTION_ZOOM = 15;

	Map.DEFAULT_MAPTYPE_ID = Microsoft.Maps.MapTypeId.road;

	Map.EVENT_IDLE = "viewchangeend";
	Map.EVENT_CLICK = "click";
	Map.EVENT_ZOOM_CHANGED = "viewchangeend";
	Map.EVENT_BOUND_CHANGED = "viewchangeend";
	
	Number.prototype.toRad = function() {  // convert degrees to radians
		return this * Math.PI / 180;
	};

	Map.computeDistanceBetween = function(p1, p2) {
		return google.maps.geometry.spherical.computeDistanceBetween(
				new google.maps.LatLng(p1.latitude, p1.longitude),
				new google.maps.LatLng(p2.latitude, p2.longitude));
		// disable haversine formula
		// Haversine formula to calculate distance
		// var R = 6378135; // meter
		// var dLat = (p2.latitude - p1.latitude).toRad();
		// var dLon = (p2.longitude - p1.longitude).toRad();
		// var lat1 = p1.latitude.toRad();
		// var lat2 = p2.latitude.toRad();
		//
		// var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2)
		// * Math.sin(dLon / 2) * Math.cos(lat1)
		// * Math.cos(lat2);
		// var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		// return R * c; // distance in meters
	};

	Map.prototype.getMap = function() {
		return this.map;
	};

	Map.prototype._doSearchLocation = function(location, onOK, onFail) {
		var request =
		{
			query: location,
			count: 1,
			startIndex: 0,
			callback : function(result) {
				if (result
						&& result.searchRegion
						&& result.searchRegion.address
						&& result.searchRegion.mapBounds) {
					onOK(result.searchRegion.mapBounds.locationRect.center,
							result.searchRegion.address.formattedAddress);
				}
			},
			errorCallback: onFail,
			userData: {}
		};
		this.searchManager.search(request);
	};

	Map.prototype.searchLocation = function(location, onOK, onFail) {
		var self = this;
		this._searchManangerPromise(function() {
			self._doSearchLocation(location, onOK, onFail);
		});
	};

	Map.prototype._searchManangerPromise = function(callback) {
		var self = this;
		if (this.searchManager) {
			callback.call(this);
		} else {
			Microsoft.Maps.loadModule("Microsoft.Maps.Search", {callback: function() {
				self.map.addComponent('searchManager', new Microsoft.Maps.Search.SearchManager(self.map));
				self.searchManager = self.map.getComponent('searchManager');
				callback.call(self);
			}});
		}
	};

	Map.prototype.searchText = function(term, callback) {
		var self = this;
    	this.placesService = this.placeService
				|| new google.maps.places.PlacesService(new google.maps.Map($("<div />").hide().get(0)));
    	this.placesService.textSearch({
			query : term,
			types : PLACE_TYPES,
			radius : 50000,
			location : new google.maps.LatLng(self.map.getCenter().latitude, self.map.getCenter().longitude)
		}, function(results, status) {
			var callbackStatus = status === google.maps.places.PlacesServiceStatus.OK ? "OK" : "error";
			for ( var i = results.length - 1; i > -1; i--) {
				results[i].geometry.location = {
					latitude : results[i].geometry.location.d,
					longitude : results[i].geometry.location.e
				};
			}
			callback.call(this, results, callbackStatus);
		});
	};

	Map.prototype.addMarker = function(marker) {
		this.map.entities.push(marker);
	};

	Map.prototype.removeMarker = function(marker) {
		for ( var i = this.map.entities.getLength() - 1; i >= 0; i--) {
			var pushpin = this.map.entities.get(i);
			if (pushpin instanceof Microsoft.Maps.Pushpin) {
				(marker === pushpin) && this.map.entities.removeAt(i);
			}
		}
	};

	Map.prototype.getZoom = function() {
		return this.map.getZoom();
	};

	Map.prototype.setZoom = function(zoom) {
		this.map.setView({
			zoom : zoom
		});
	};

	Map.prototype.setCenter = function(point) {
		this.map.setView({
			center : point,
			zoom: Map.VISIBLE_ZOOM
		});
	};

	Map.prototype.addListener = function(callback) {
		if (arguments.length === 1 && typeof arguments[0] === "object") {
			for ( var event in arguments[0]) {
				Microsoft.Maps.Events.addThrottledHandler(this.map, event, arguments[0][event], EVENT_THRESHOLD);
			}
		} else if (arguments.length === 2) {
			Microsoft.Maps.Events.addThrottledHandler(this.map, arguments[0], arguments[1], EVENT_THRESHOLD);
		}
	};

	Map.prototype.addListenerOnce = function(callback) {
		var args = arguments;
		if (arguments.length === 1 && typeof arguments[0] === "object") {
			for ( var event in arguments[0]) {
				var handlerId = Microsoft.Maps.Events.addThrottledHandler(this.map, event, function() {
					Microsoft.Maps.Events.removeHandler(handlerId);
					args[0][event].call(this);
				}, EVENT_THRESHOLD);
			}
		} else if (arguments.length === 2) {
			var handlerId = Microsoft.Maps.Events.addThrottledHandler(this.map, arguments[0], function() {
				Microsoft.Maps.Events.removeHandler(handlerId);
				args[1].call(this);
			}, EVENT_THRESHOLD);
		}
	};

	Map.prototype.trigger = function(event) {
		Microsoft.Maps.Events.invoke(this.map, event, null);
	};

	Map.prototype.diagonal = function() {
		return Map.computeDistanceBetween(this.map.getBounds().getSoutheast(), this.map.getBounds().getNorthwest());
	};

	Map.prototype.getSouthWestPoint = function() {
		return new Microsoft.Maps.Location(this.map.getBounds().getSoutheast().latitude,
				this.map.getBounds().getNorthwest().longitude);
	};

	Map.prototype.getNorthEastPoint = function() {
		return new Microsoft.Maps.Location(this.map.getBounds().getNorthwest().latitude,
				this.map.getBounds().getSoutheast().longitude);
	};

	Map.prototype.fitBounds = function(markers) {
		var locs = [];
		for ( var i = markers.length - 1; i >= 0; i--) {
			locs.push(markers[i].getLocation());
		}

		var bounds = Microsoft.Maps.LocationRect.fromLocations(locs);
		if (locs.length == 1) {
			this.map.setView({
				center : locs[0],
				zoom : 16
			});
		} else {
			this.map.setView({
				bounds : bounds
			});
		}
	};

	return Map;
});