define([ "bmaps", "infobox" ], function(bmap, INFOBOX) {

	var iconSize = {};

	return {
		MARKER_MAX_ZINDEX : 9999,

		MARKER_EVENT_MOUSE_IN : "mouseover",
		MARKER_EVENT_MOUSE_OUT : "mouseout",

		INFOBOX_CLOSE_TIMER : 600,

		newPoint : function() {
			if (arguments.length === 1 && typeof arguments[0] === "object") {
				return new Microsoft.Maps.Location(arguments[0].lat, arguments[0].lng);
			} else if (arguments.length === 2) {
				var point = Object.create(Microsoft.Maps.Location.prototype);
				Microsoft.Maps.Location.apply(point, arguments);
				return point;
			}
		},

		pointLat : function(point) {
			return point.latitude;
		},

		pointLng : function(point) {
			return point.longitude;
		},

		newMarker : function(option) {
			option.typeName = "pointer";
			var position = option.position ? option.position : null,
				marker = new Microsoft.Maps.Pushpin(position, option);
			if (option.icon) {
				if (option.icon in iconSize) {
					marker.setOptions({
						height : iconSize[option.icon].height,
						width : iconSize[option.icon].width
					});
				} else {
					var newImg = new Image();
					newImg.onload = function() {
						var self = this;
						iconSize[option.icon] = {
							width : self.width,
							height : self.height
						};
						
						marker.setOptions({
							height : iconSize[option.icon].height,
							width : iconSize[option.icon].width
						});
					};
					newImg.src = option.icon;
				}
			}
			
			marker.oid = option.oid;

			return marker;
		},

		markerAddListener : function() {
			if (arguments.length === 2 && typeof arguments[1] === "object") {
				for ( var event in arguments[1]) {
					Microsoft.Maps.Events.addHandler(arguments[0], event, arguments[1][event]);
				}
			} else if (arguments.length === 3) {
				Microsoft.Maps.Events.addHandler(arguments[0], arguments[1], arguments[2]);
			}
		},

		markerGetPoint : function(marker) {
			return marker.getLocation();
		},

		markerSetPoint : function(marker, point) {
			marker.setLocation(point);
		},

		markerSetIcon : function(marker, icon) {
			if (typeof icon === "object") {
				var option = {
					icon : icon.url,
					height : icon.size.y,
					width : icon.size.x,
					anchor : new Microsoft.Maps.Point(icon.anchor.x, icon.anchor.y)
				};
				marker.setOptions(option);
			} else {
				if (!(icon in iconSize)) {
					iconSize[icon] = {};
					var newImg = new Image();
					newImg.onload = function() {
						var self = this;
						iconSize[icon] = {
							width : self.width,
							height : self.height
						};

						marker.setOptions({
							height : iconSize[icon].height,
							width : iconSize[icon].width
						});
					};
					newImg.src = icon;
				}

				marker.setOptions({
					icon : icon,
					height : iconSize[icon].height || 0,
					width : iconSize[icon].width || 0
				});
			}
		},

		markerSetZIndex : function(marker, zindex) {
			marker.setOptions({
				zIndex : zindex
			});
		},

		newInfobox : function(option, map) {
			// some adapter might be needed here
			var bingOption = {
				minHeight : option.minHeight,
				minWidth : option.minWidth,
				showCloseButton : !option.hideCloseButton,
				orientation : 1,
				color : '#fff',
				borderColor : "transparent",
				borderRadius : 4, // option.borderRadius,
				arrowWidth : 20,
				arrowLength : 10
			};

			var self = this, box = new CustomInfobox(map, bingOption);
			$("#bing-map-infobox").mouseenter(function() {
				self.infoboxClearCloseTimer(box, map);
			}).mouseleave(function() {
				self.infoboxCloseOnTimer(box, map, self.INFOBOX_CLOSE_TIMER);
			});

			return box;
		},

		infoxboxAddListener : function(box, selector, event, callback) {
			$("#bing-map-infobox").on(event, selector, function() {
				arguments[0].stopPropagation();
				callback.apply(this, arguments);
			});
		},

		infoboxClose : function(box, map /* map is a bing map instance */) {
			box.hide();
		},

		infoboxCloseOnTimer : function(box, map, elapse) {
			if (box["timer"] != null) {
				this.infoboxClearCloseTimer(box, map);
			}

			box["timer"] = setTimeout(function() {
				box.hide();
			}, elapse);
		},

		infoboxClearCloseTimer : function(box, map) {
			clearTimeout(box["timer"]);
			box["timer"] = null;
		},

		infoboxOpen : function(box, marker, html, map /*
														 * map is a bing map
														 * instance
														 */) {
			box.hide();
			box.setOptions({
				offset : {
					x : 0,
					y : marker.getHeight()
				},
				location : marker.getLocation(),
				htmlContent : html
			});

			box.show(marker.getLocation(), html);
		},

		infoboxPutData : function(box, key, value) {
			box[key] = value;
		},

		infoboxGetData : function(box, key) {
			return box[key];
		},

		infoboxSetArrowPosition : function(box, position) {
			box.getContent().css("left", box.getArrowXVector() ? "-9px" : "9px");
		}

	};
});