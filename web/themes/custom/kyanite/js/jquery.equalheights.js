(function ($, window, document) {
	/* 	Author: Jesse Voogt
		License: just use it for whatever you wish
		Purpose: makes items in the selector have the same (min) heights
				This is useful because of lack of support for fancy css $that could handle this
				For example you want a 2x2 grid, where each cell has class, you might apply a style like so to each cell:
		.cell {
			width: 50%;
			float: left;
		}

		If one of the heights is different from the other, they won't align nicely at all.
		So you just call this plugin like so:
			$(".cell").equalHeights();
			
		By default, it will apply min-height & max-height styles equal to the largest cell's height.
		To try to ensure the height will be enforced, both min and max heights are set, rather than just 'height'
		
	*/
	var logEnabled = false;
	
	$.fn.equalHeights = function(options){
		log("jquery.equal.heights.js");
		if (typeof options == "string"){
			return this.each(function(){
				var functionName = options;
				var api = $(this).data("equal-heights-api");
				var args = $.makeArray(arguments);
				args.shift();
				if (api && api[functionName]) api[functionName].apply(this, args);
			});
		}
		var o = $.extend({
			windowEvents: 'load resize orientationchange',
			mustApply: null // set to a like so: function(){return trueOrFalse;}
		}, options);
		var $that = this;
		if (!$that.length) return $that;
		function log(msg){
			if (logEnabled && window.console && window.console.log) window.console.log(msg);
		}
		function apply(){
			//log("jquery.equal.heights.js: apply");
			var maxHeight = 0;
			$that.css("min-height", "").css("max-height", "");
			if (o.mustApply) {
				if (!o.mustApply()){
					log("do not apply");
					return;
				}
			}
			$that.each(function(){
				maxHeight = Math.max(maxHeight, $(this).height());
			});
			if (maxHeight > 0) $that.css({
				"min-height": maxHeight + "px"
				, "max-height": maxHeight + "px"
			});
		}
		function destroy(){
			//log("jquery.equal.heights.js: destroy");
			if (o.windowEvents) $(window).unbind(o.windowEvents);
			$that.removeData("equal-heights-api");
			$that.removeClass("jquery-equal-heights");
			$that.css("min-height","").css("max-height", "");
			$that = null;
			o = null;
		}
		function init(){
			//log("jquery.equal.heights.js: init");
			var $preExistingInstance = $that.filter(".jquery-equal-heights:first");
			if ($preExistingInstance.length) {
				var api = $preExistingInstance.data("equal-heights-api");
				api.apply();
				return; //already initialized, just use the api -- call destroy if you want to alter behavior after initial call
			}
			$that.addClass("jquery-equal-heights");
			if (o.windowEvents) {
				$(window).bind(o.windowEvents, apply);
			}
			$that.data("equal-heights-api", {
				destroy: destroy,
				getGroup: function (){
					return $that;
				},
				apply: apply
			});
			apply();
		}
		init();
		return this;
	}
})(jQuery, window, document);