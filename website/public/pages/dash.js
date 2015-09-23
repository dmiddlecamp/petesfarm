/**
 * Created by middleca on 9/22/15.
 *
 * Notes:
 *
 * * C3 is slow, and a little picky.
 * * chart.js is slow, and doesn't scale the x axis properly, doesn't understand the time, just thinks they're labels
 * * maybe chart.js / c3 are better fits for very small summary datasets?
 * [x]  should try http://dygraphs.com/ next.
 */



(function() {
	/* source for the dash page */

	/*
	TODO: show current value when clicking graph
	TODO: initialize current value label to latest reading w/Timestamp on load
	TODO: add dynamic updating to charts
	TODO: make page look nice
	TODO: load weather forecast for tonight / tomorrow
	TODO: quick infographic view of last values / heads up readout?
		## get latest row:
		/data/weather.json?count=1&sort=DESC

	TODO: add coop decibels
	TODO: add wind direction
	 */


	var Page = function() {};
	Page.prototype = {
		init: function() {
			this.makeTubChart();

			this.makeMiniCharts();

			this.makeCoopChart();
			this.makeWeatherChart();
			this.makePressureChart();

			console.log("loaded!");
		},

		makeMiniCharts: function() {
			this._miniSoilTemp = this._makeMini("miniSoilTemp", "Soil", 60, "/data/weather.csv?columns=soilTemp,published_at&count=1440&sort=DESC");
			this._miniWindSpeed = this._makeMini("miniWindSpeed", "Wind", 60, "/data/weather.csv?columns=wind_mph,published_at&count=1440&sort=DESC");
			this._miniHumidity = this._makeMini("miniHumidity", "Humidity", 60, "/data/weather.csv?columns=humidity,published_at&count=1440&sort=DESC");

			this._miniTub = this._makeMini("miniTub", "Tub", 1, "/data/tub.csv?columns=temp,published_at&count=60&sort=DESC");
			this._miniCoop = this._makeMini("miniCoop", "Coop", 5, "/data/coop.csv?columns=temp,published_at&count=120&sort=DESC");
		},

		_makeMini: function(divID, title, smoothing, query) {
			return new Dygraph(
				document.getElementById(divID),
				query,
				{
					title: title,
					rollPeriod: smoothing
				});
		},


		/**
		 * using dygraphs
		 */
		makeCoopChart: function() {
			this.coopChart = new Dygraph(
				document.getElementById("coopChart"),
				"/data/coop.csv",
				{
					showRangeSelector: true,
					showRoller: true,
					//customBars: true,
					title: 'Chicken Coop Temperatures',
					ylabel: 'Temperature (F)',
					legend: 'always',
					labelsDivStyles: { 'textAlign': 'right' }
				}
			);
		},

		/**
		 * using dygraphs
		 */
		makeTubChart: function() {
			this.tubChart = new Dygraph(
				document.getElementById("tubChart"),
				"/data/tub.csv",
				{
					showRangeSelector: true,
					title: 'Hot Tub Temperature',
					ylabel: 'Temperature (F)',
					legend: 'always',
					labelsDivStyles: { 'textAlign': 'right' }

					//rollPeriod: 3
					//errorBars: true
				}
			);
		},

		/**
		 * using dygraphs
		 */
		makeWeatherChart: function() {
			this.weatherChart = new Dygraph(
				document.getElementById("weatherChart"),
				"/data/weather.csv?columns=temp1,soilTemp,humidity,wind_mph,rain,published_at", {
					showRangeSelector: true,
					rollPeriod: 5,
					title: 'Weather History',
					ylabel: '*F, MPH, % humidity, inches',
					legend: 'always',
					labelsDivStyles: { 'textAlign': 'right' }
				}
			);
		},

		makePressureChart: function() {
			this.pressureChart = new Dygraph(
				document.getElementById("pressureChart"),
				"/data/weather.csv?columns=pressure,published_at", {
					showRangeSelector: true,
					rollPeriod: 5,
					title: 'Air Pressure History',
					ylabel: 'pressure',
					legend: 'always',
					labelsDivStyles: { 'textAlign': 'right' }
				}
			);
		},


		//saved as a reference

		//		/**
		//		 * using c3.js
		//		 */
		//		makeTubChart: function() {
		//			this.tubChart = c3.generate({
		//				bindto: "#tubChart",
		//				data: {
		//					mimeType: 'json',
		//					url: '/data/tub.json',
		//					keys: {
		//						x: 'published_at',
		//						value: ['temp']
		//					}
		//				},
		//				axis: {
		//					x: {
		//						type: 'timeseries',
		//						tick: {
		//							format: '%a, %m-%d %H:%M'
		//						}
		//					}
		//				}
		//			});
		//		},
		//
		//		/**
		//		 * using chart.js
		//		 */
		//		makeTubChart2: function() {
		//			var makeChart = function(labels, series) {
		//				var data = {
		//					labels: labels,
		//					datasets: [
		//						{
		//							label: "My First dataset",
		//							fillColor: "rgba(220,220,220,0.2)",
		//							strokeColor: "rgba(220,220,220,1)",
		//							pointColor: "rgba(220,220,220,1)",
		//							pointStrokeColor: "#fff",
		//							pointHighlightFill: "#fff",
		//							pointHighlightStroke: "rgba(220,220,220,1)",
		//							data: series
		//						}
		//					]
		//				};
		//
		//				var ctx = $("#tubChart2").get(0).getContext("2d");
		//				var tubChart2 = new Chart(ctx).Line(data);
		//			};
		//
		//			$.ajax({
		//				url: "/data/tub.json",
		//				success: function(data) {
		//					var labels = [];
		//					var series = [];
		//
		//					for(var i = 0; i < data.length; i++) {
		//						var d = data[i];
		//
		//						var timeLabel = moment(d.published_at).format("ddd, h:mm A");
		//
		//						labels.push(timeLabel);
		//						series.push(d.temp);
		//					}
		//					makeChart(labels, series);
		//				}
		//			});
		//		},


		_: null
	};

	var page = new Page();
	page.init();
	window.Page = page;
})();