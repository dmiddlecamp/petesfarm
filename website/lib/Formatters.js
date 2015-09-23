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
		for(var i=0;i<records.length;i++) {
			var r = records[i];
			//r[time_prop] = moment(r[time_prop]).toJSON();
			r[time_prop] = moment(r[time_prop]).valueOf();
		}
		return records;
	},

	_:null
};
module.exports = Formatters;