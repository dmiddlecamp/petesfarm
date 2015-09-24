/**
 * Created by middleca on 9/22/15.
 */

var moment = require('moment');
var util = require('util');

var Formatters = {
	//	asCSV: function(records) {
	//		for(var i=0;i<records;i++) {
	//
	//		}
	//	},

	/**
	 * cleans up TIME.
	 * @param records
	 * @param time_prop
	 */
	timeCop: function(records, time_prop, asNumeric) {
		for(var i = 0; i < records.length; i++) {
			var r = records[i];
			if (asNumeric) {
				r[time_prop] = moment(r[time_prop]).valueOf();
			}
			else {
				r[time_prop] = moment(r[time_prop]).toJSON();
			}
		}
		return records;
	},

	/**
	 * physical things with sensors in the real world sometime have weird readings.  go figure!
	 * lets filter out some nonsense.
	 * @param records
	 * @param value_prop
	 * @param allowed_min
	 * @param allowed_max
	 */
	bruteForceFilter: function(records, value_prop, allowed_min, allowed_max) {
		var result = [];
		for(var i = 0; i < records.length; i++) {
			var r = records[i];
			var value = r[value_prop];

			// if they're not in range, just drop them entirely.
			if ((value >= allowed_min) && (value <= allowed_max)) {
				result.push(r);
			}
		}
		return result;
	},

	/**
	 * similar to the filter, but instead of dropping the record, just adjusts the outlier value to something
	 * reasonable.  We're cheating a bit here, but this is more useful than extreme outliers
	 *
	 * @param records
	 * @param value_prop
	 * @param allowed_min
	 * @param allowed_max
	 * @returns {Array}
	 */
	bruteForceSmooth: function(records, value_prop, allowed_min, allowed_max) {
		for(var i = 0; i < records.length; i++) {
			var r = records[i];
			var value = r[value_prop];

			if ((value < allowed_min) || (value > allowed_max)) {
				// we're outside the allowed range.

				var lastValue = 0, nextValue = 0;
				if (i > 0) {
					lastValue = nextValue = records[i - 1][value_prop];
				}
				if ((i + 1) < records.length) {
					nextValue = records[i + 1][value_prop];
				}

				r[value_prop] = (lastValue + nextValue) / 2.0;
			}
		}
		return records;
	},

	/**
	 * cheaply formats json objects into a CSV string
	 * @param records
	 * @param firstColumn if specified, ensures this column is first in the CSV
	 * @returns {string}
	 */
	asCSV: function(records, firstColumn) {
		if (!records || (records.length == 0)) {
			return "";
		}

		// assume the first row has all the properties
		var firstRow = records[0];
		var columns = [];
		var rows = [];

		for(var key in firstRow) {
			if (key == firstColumn) {
				continue;
			}

			columns.push(key);
		}
		if (firstColumn) {
			columns.splice(0, 0, firstColumn);
		}

		rows.push(columns.join(","));

		for(var i = 0; i < records.length; i++) {
			var r = records[i];

			var line = [];

			for(var c = 0; c < columns.length; c++) {
				var prop = columns[c];
				line.push(r[prop]);
			}

			//Note: this doesn't do any fancy CSV escaping.  Insert your favorite CSV solution here
			rows.push(line.join(","));
		}

		return rows.join("\n");
	},

	/**
	 * trim floats to 0 digits
	 * make dates pretty.
	 * @param latest
	 */
	formatLatest: function(latest) {
		for(var key in latest) {
			var area = latest[key];
			for(var subkey in area) {
				var value = area[subkey];
				var result;

				if (typeof value == "number") {
					result = Math.round(value)
				}
				else if (util.isDate(value)) {
					result = moment(value).fromNow();
				}
				area[subkey] = result;
			}
		}
		return latest;
	},

	_: null
};
module.exports = Formatters;