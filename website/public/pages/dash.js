/**
 * Created by middleca on 9/22/15.
 *
 * Notes:
 *
 * * C3 is slow, and a little picky.
 * * chart.js is slow, and doesn't scale the x axis properly, doesn't understand the time, just thinks they're labels
 * * maybe chart.js / c3 are better fits for very small summary datasets?
 * [ ]  should try http://dygraphs.com/ next.
 */



(function() {
	/* source for the dash page */

	var Page = function() {};
	Page.prototype = {
		init: function() {
			this.makeTubChart();
			//this.makeTubChart2();

			this.makeWeatherChart();
			this.makeCoopChart();
			this.makeCoopChart2();

			console.log("loaded!");
		},

		/**
		 * using c3.js
		 */
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

		/**
		 * using c3.js
		 */
		makeCoopChart: function() {
			this.coopChart = c3.generate({
				bindto: "#coopChart",
				data: {
					mimeType: 'json',
					url: '/data/coop.json',
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

		/**
		 * using dygraphs
		 */
		makeCoopChart2: function() {


			g = new Dygraph(
				// containing div
				document.getElementById("coopChart2"),
				"/data/coop.csv"
			);


		},

		/**
		 * using c3.js
		 */
		makeWeatherChart: function() {
			this.weatherChart = c3.generate({
				bindto: "#weatherChart",
				data: {
					mimeType: 'json',
					url: '/data/weather.json',
					keys: {
						x: 'published_at',
						value: [
							'temp1',
							'temp2',
							'humidity',
							'pressure',
							'altitude',
							'wind_mph',
							'soilTemp'
						]


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

		/**
		 * using chart.js
		 */
		makeTubChart2: function() {
			var makeChart = function(labels, series) {
				var data = {
					labels: labels,
					datasets: [
						{
							label: "My First dataset",
							fillColor: "rgba(220,220,220,0.2)",
							strokeColor: "rgba(220,220,220,1)",
							pointColor: "rgba(220,220,220,1)",
							pointStrokeColor: "#fff",
							pointHighlightFill: "#fff",
							pointHighlightStroke: "rgba(220,220,220,1)",
							data: series
						}
					]
				};

				var ctx = $("#tubChart2").get(0).getContext("2d");
				var tubChart2 = new Chart(ctx).Line(data);
			};

			$.ajax({
				url: "/data/tub.json",
				success: function(data) {
					var labels = [];
					var series = [];

					for(var i = 0; i < data.length; i++) {
						var d = data[i];

						var timeLabel = moment(d.published_at).format("ddd, h:mm A");

						labels.push(timeLabel);
						series.push(d.temp);
					}
					makeChart(labels, series);
				}
			});


		},


		_: null
	};

	var page = new Page();
	page.init();
	window.Page = page;
})();