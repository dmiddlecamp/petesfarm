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
		try {
			console.log("db connect - start");

			if (this._connection) {
				console.log("db connect - reusing connection");
				return when.resolve(this._connection);
			}

			var that = this;
			var dfd = when.defer();

			console.log("db connect - attempting connection");
			var connection = new sql.Connection(settings.database_config, function(err) {
				console.log("db connect - callback, err was ", err);

				if (err) {
					console.error("error setting up db connection ", err);
					return dfd.reject(err);
				}
				else {
					console.log("db connect - uh, I guess we're fine?");

					that._connection = connection;
					sql.on('error', function(err) {
						console.error("sql error!? ", err);
					});
					that._connection.on('error', function(err) {
						console.error("sql conn error!? ", err);
					});
					return dfd.resolve(that._connection);
				}
			});

			return dfd.promise;
		}
		catch(ex) {
			console.error("database connect exploded ", ex);
			return when.reject(ex);
		}
	},


	/**
	 * external interface, uses the existing connection and runs a query
	 * @param querySql
	 * @returns {*}
	 */
	query: function(querySql) {
		console.log("db query - query start");

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