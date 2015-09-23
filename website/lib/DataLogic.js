/**
 * Created by middleca on 9/23/15.
 */

var Database = require('./Database.js');
var Formatters = require('./Formatters.js');
var utilities = require('./Utilities.js');
var when = require('when');


var DataLogic = {
	getParams: function(req) {
		return {
			count: parseInt(req.param("count", 4320)),
			sort: req.param("sort", "ASC").substring(0, 4),
			columns: req.param("columns")
		};
	},

	/**
	 * encapsulates common API query params
	 *
	 * count, sort, columns, and more!
	 *
	 * @param params
	 * @param tableName
	 * @param orderColumn
	 * @param allowedColumns
	 * @returns {*}
	 */
	dbQuery: function(params, tableName, orderColumn, allowedColumns) {

		if (typeof params.param == "function") {
			//we got passed a req, instead of just an object.
			params = DataLogic.getParams(params);
		}

		var count = params.count;
		var ascDesc = params.sort;

		var userColumns = allowedColumns;
		var columnsParam = params.columns;
		if (columnsParam) {
			userColumns = columnsParam.split(",");

			//sanitize your inputs kids!
			userColumns = utilities.filterListInList(allowedColumns, userColumns);
		}

		var query = "select "
			+ "top " + count + " "
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
	},

	getLatest: function(req) {

		return when.all([
			DataLogic.coopQuery({count: 1, sort: "DESC"}),
			DataLogic.tubQuery({count: 1, sort: "DESC"}),
			DataLogic.weatherQuery({count: 1, sort: "DESC"})
		]).then(function(arr) {
			//helper, checks to make sure we're not reaching into an empty array
			var getIdx = function(arr, idx) {
				return (arr[idx] && (arr[idx].length > 0)) ? arr[idx][0] : null;
			};

			var result = {
				coop: getIdx(arr, 0),
				tub: getIdx(arr, 1),
				weather: getIdx(arr, 2)
			};
			return when.resolve(result)
		});
	}
};
module.exports = DataLogic;
