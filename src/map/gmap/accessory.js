define([ "gmaps", "infobubble" ], function(gmap, NOT_AMD) {

	return {
		MARKER_MAX_ZINDEX : google.maps.Marker.MAX_ZINDEX,

		MARKER_EVENT_MOUSE_IN: "mouseover",
		MARKER_EVENT_MOUSE_OUT: "mouseout",

		INFOBOX_CLOSE_TIMER: 600,

		newPoint : function() {
			if (arguments.length === 1 && typeof arguments[0] === "object") {
				return new google.maps.LatLng(arguments[0].lat, arguments[0].lng);
			} else if (arguments.length === 2) {
				var point = Object.create(google.maps.LatLng.prototype);
				google.maps.LatLng.apply(point, arguments);
				return point;
			}
		},

		pointLat : function(point) {
			return point.lat();
		},

		pointLng : function(point) {
			return point.lng();
		},

		newMarker : function(option) {
			var marker = new google.maps.Marker(option);

			return marker;
		},

		markerAddListener : function() {
			if (arguments.length === 2 && typeof arguments[1] === "object") {
				for ( var event in arguments[1]) {
					google.maps.event.addListener(arguments[0], event, arguments[1][event]);
				}
			} else if (arguments.length === 3) {
				google.maps.event.addListener(arguments[0], arguments[1], arguments[2]);
			}
		},

		markerGetPoint : function(marker) {
			return marker.getPosition();
		},

		markerSetPoint : function(marker, point) {
			marker.setPosition(point);
		},

		markerSetIcon : function(marker, icon) {
			if (typeof icon === "object") {
				var image = {
					url : icon.url,
					size : new google.maps.Size(icon.size.x, icon.size.y),
					origin : new google.maps.Point(icon.origin.x, icon.origin.y),
					anchor : new google.maps.Point(icon.anchor.x, icon.anchor.y)
				};
				marker.setIcon(image);
			} else {
				marker.setIcon(icon);
			}
		},

		markerSetZIndex : function(marker, zindex) {
			marker.setZIndex(zindex);
		},

		newInfobox : function(option) {
			// some adapter might be needed here
			return new InfoBubble(option);
		},

		infoxboxAddListener : function(box, selector, event, callback) {
			$(box.bubble_).on(event, selector, callback);
		},

		infoboxClose : function(box, map /* map is a google map instance */) {
			box.close();
		},

		infoboxCloseOnTimer : function(box, map, elapse) {
			if (box["timer"] != null) {
				this.infoboxClearCloseTimer(box, map);
			}

			box["timer"] = setTimeout(function() {
				box.close();
			}, elapse);
		},

		infoboxClearCloseTimer: function(box, map) {
			clearTimeout(box["timer"]);
			box["timer"] = null;
		},

		infoboxOpen : function(box, marker, html, map /* map is a google map instance */) {
			box.close();
			box.setContent(html);
			box.open(map, marker);
		},

		infoboxPutData : function(box, key, value) {
			box[key] = value;
		},

		infoboxGetData : function(box, key) {
			return box[key];
		},

		infoboxSetArrowPosition : function(box, position) {
			box.setArrowPosition(position);
		}

	};
});