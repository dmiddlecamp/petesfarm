var express = require('express');
var Database = require('../lib/Database.js');
var Formatters = require('../lib/Formatters.js');
var utilities = require('../lib/Utilities.js');
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
	/**
	 * encapsulates common API query params
	 *
	 * count, sort, columns, and more!
	 *
	 * @param req
	 * @param tableName
	 * @param orderColumn
	 * @param allowedColumns
	 * @returns {*}
	 */
	dbQuery: function(req, tableName, orderColumn, allowedColumns) {
		var numRows = parseInt(req.param("count", 4320));

		var ascDesc = req.param("sort", "ASC").substring(0, 4);

		var userColumns = allowedColumns;
		var columnsParam = req.param("columns");
		if (columnsParam) {
			userColumns = columnsParam.split(",");

			//sanitize your inputs kids!
			userColumns = utilities.filterListInList(allowedColumns, userColumns);
		}



		var query = "select "
			+ "top " + numRows + " "
			+ userColumns.join(", ") +
			" from " + tableName + " order by " + orderColumn + " " + ascDesc;

		return Database.query(query);
	},

	coopQuery: function(req) {
		var allowedColumns = "temp,published_at".split(",");
		return DataLogic.dbQuery(req, "coop", "published_at", allowedColumns)
			.then(function(records) {
				records = Formatters.bruteForceFilter(records, "temp", -100, 200);
				return when.resolve(records);
			});

	},
	tubQuery: function(req) {
		var allowedColumns = "temp,published_at".split(",");
		return DataLogic.dbQuery(req, "tub", "published_at", allowedColumns)
			.then(function(records) {
				return when.resolve(records);
			});
	},
	weatherQuery: function(req) {
		var allowedColumns = "temp1,temp2,humidity,pressure,altitude,wind_mph,soilTemp,rain,published_at".split(",");
		return DataLogic.dbQuery(req, "weather", "published_at", allowedColumns)
			.then(function(records) {
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
