/**
 * Created by middleca on 9/22/15.
 */
var sql = require('mssql');
var when = require('when');
var pipeline = require('when/pipeline');

var settings = require("../settings.js");

var Database = function() {

};

Database.prototype = {
	_connection: null,

	connect: function() {
		if (this._connection) {
			return when.resolve(this._connection);
		}

		var that = this;
		var dfd = when.defer();
		var connection = new sql.Connection(settings.database_config, function(err) {
			if (err) {
				console.error("error setting up db connection ", err);
				return dfd.reject(err);
			}
			else {
				that._connection = connection;
				return dfd.resolve(that._connection);
			}
		});

		return dfd.promise;
	},


	/**
	 * external interface, uses the existing connection and runs a query
	 * @param querySql
	 * @returns {*}
	 */
	query: function(querySql) {
		return pipeline([
			this.connect.bind(this),
			this._query.bind(this, querySql)
		]);
	},


	/**
	 * internal helper that takes a connection / sql query
	 * @param querySql
	 * @param conn
	 * @returns {defer.promise|*|Promise|promise|Handler.promise|when.promise}
	 * @private
	 */
	_query: function(querySql, conn) {
		var dfd = when.defer();
		var req = new sql.Request(conn);
		req.query(querySql, function(err, records) {
			if (err) {
				dfd.reject(err);
			}
			else {
				dfd.resolve(records);
			}
		});
		return dfd.promise;
	},

	_: null
};

module.exports = new Database();