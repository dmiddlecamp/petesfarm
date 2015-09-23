/**
 * Created by middleca on 9/23/15.
 */

var utilities = {

	/**
	 * check everything in the needle array to see if it's in the haystack array.
	 * return a list of the results, drop things that aren't contained.
	 * @param haystackArr
	 * @param needleArr
	 */
	filterListInList: function(haystackArr, needleArr) {
		var hash = {};
		for(var i=0;i<haystackArr.length;i++) {
			var key = haystackArr[i];
			hash[key] = true;
		}

		var results = [];
		for(var i=0;i<needleArr.length;i++) {
			var key = needleArr[i];
			if (hash[key]) {
				results.push(key);
			}
		}
		return results;
	},


	_:null
};
module.exports = utilities;
