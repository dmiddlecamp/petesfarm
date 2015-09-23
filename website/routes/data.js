var express = require('express');
var Database = require('../lib/Database.js');
var Formatters = require('../lib/Formatters.js');
var router = express.Router();
var when = require('when');


router.get('/', function(req, res, next) {
	res.send({
		routes: [
			{ url: "coop.json", desc: "chicken coop temperature / sound data" },
			{ url: "tub.json", desc: "hot tub temperature data" },
			{ url: "weather.json", desc: "weather station data" }
		]
	});
});

var DataLogic = {
	coopQuery: function(req) {
		var query = "select temp, published_at from coop order by published_at";
		return Database.query(query).then(function(records) {
			records = Formatters.bruteForceFilter(records, "temp", -100, 200);
			return when.resolve(records);
		});
	},
	tubQuery: function(req) {
		var query = "select temp, published_at from tub order by published_at";
		return Database.query(query).then(function(records) {
			return when.resolve(records);
		});
	},
	weatherQuery: function(req) {
		var query = "select top 4320 temp1, temp2, humidity, pressure, altitude, wind_mph, soilTemp, published_at " +
			" from weather order by published_at";

		return Database.query(query).then(function(records) {
			records = Formatters.bruteForceSmooth(records, "soilTemp", -150, 150);

			return when.resolve(records);
		});
	}
};


router.get('/coop.json', function(req, res, next) {
	DataLogic.coopQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", true);

			res.send(records);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});
router.get('/coop.csv', function(req, res, next) {
	DataLogic.coopQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", false);
			var csvResult = Formatters.asCSV(records, "published_at");
			res.send(csvResult);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});


router.get('/tub.json', function(req, res, next) {
	DataLogic.tubQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", true);
			res.send(records);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});
router.get('/tub.csv', function(req, res, next) {
	DataLogic.tubQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", false);

			var csvResult = Formatters.asCSV(records, "published_at");
			res.send(csvResult);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});




router.get('/weather.json', function(req, res, next) {
	DataLogic.weatherQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", true);
			res.send(records);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});
router.get('/weather.csv', function(req, res, next) {
	DataLogic.weatherQuery(req).then(
		function(records) {
			records = Formatters.timeCop(records, "published_at", false);

			var csvResult = Formatters.asCSV(records, "published_at");
			res.send(csvResult);
		},
		function(err) {
			res.send({ message: "something went wrong!", error: err });
		});
});


module.exports = router;
