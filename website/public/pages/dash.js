/**
 * Created by middleca on 9/22/15.
 */

(function() {
	/* source for the dash page */

	var Page = function() {};
	Page.prototype = {
		init: function() {
			this.makeTubChart();

			console.log("loaded!");
		},

		makeTubChart: function() {
			this.tubChart = c3.generate({
				bindto: "#tubChart",
				data: {
					mimeType: 'json',
					url: '/data/tub.json',
					keys: {
						x: 'published_at',
						value: ['temp']
					}
				},
				axis: {
					x: {
						type: 'timeseries',
						tick: {
							format: '%a, %m-%d %H:%M'
						}
					}
				}
			});

		},
		_: null
	};

	var page = new Page();
	page.init();
	window.Page = page;
})();