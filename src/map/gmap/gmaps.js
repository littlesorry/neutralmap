var googleScripts = (window.location.protocol === "https:" ? "https:" : "http:")
		+ "//maps.googleapis.com/maps/api/js?libraries=geometry,places&sensor=false";

define(["async!" + googleScripts], function() {
	return window.google.maps;
});