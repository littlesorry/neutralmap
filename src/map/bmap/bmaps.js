var bingScripts = (window.location.protocol === "https:" ? "https:" : "http:")
		+ "//ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0"
		+ (window.location.protocol === "https:" ? "&s=1" : "")
		+ "!onscriptload";

define(["async!" + bingScripts], function() {
	return window.Microsoft.Maps;
});