/**
 * Created by middleca on 9/22/15.
 */

(function() {
	/* source for the dash page */

	var Page = function() {};
	Page.prototype = {
		init: function() {
			console.log("yo");
		},
		_: null
	};

	var page = new Page();
	page.init();
	window.Page = page;
})();