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
		return DataLogic.dbQuery(req, "tub", ["temp", "published_at"], "published_at");
	},
	weatherQuery: function(req) {
		var columns = "temp1,temp2,humidity,pressure,altitude,wind_mph,soilTemp,published_at".split(",");
		return DataLogic.dbQuery(req, "weather", columns, "published_at");
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
	var query = "select temp, published_at from tub order by published_at";
	Database.query(query).then(function(records) {
		records = Formatters.timeCop(records, "published_at", true);
		res.json(records);
	}, function(err) {
		res.send("something went wrong!");
	});
});

router.get('/weather.json', function(req, res, next) {
	var query = "select top 4320 temp1, temp2, humidity, pressure, altitude, wind_mph, soilTemp, published_at " +
		" from weather order by published_at";
	Database.query(query).then(function(records) {
		records = Formatters.timeCop(records, "published_at", true);
		records = Formatters.bruteForceSmooth(records, "soilTemp", -150, 150);

		res.json(records);
	}, function(err) {
		res.send("something went wrong!");
	});


});

module.exports = router;
