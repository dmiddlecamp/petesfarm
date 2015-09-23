/**
 * Created by middleca on 9/22/15.
 */

var moment = require('moment');

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
	timeCop: function(records, time_prop) {
		for(var i = 0; i < records.length; i++) {
			var r = records[i];
			//r[time_prop] = moment(r[time_prop]).toJSON();
			r[time_prop] = moment(r[time_prop]).valueOf();
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

	_: null
};
module.exports = Formatters;