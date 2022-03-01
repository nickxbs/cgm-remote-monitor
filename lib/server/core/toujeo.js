// const fs = s;
module.exports = function (weight, tou) {
	// require('json.date-extensions');
	// JSON.useDateParser();
	// var jsontou = JSON.stringify(tou);
	// var tou = JSON.parseWithDate(jsontou);
	console.log(tou);

	// activities be expressed as U/min !!!
	let timeSinceToujeoAct = tou.map(entry => {

		var time = entry.time;
		var insulin = entry.insulin;
		var duration = (24 + (14 * insulin / weight));
		var peak = (duration / 2.5);
		var tp = peak;
		var td = duration;

		var tau = tp * (1 - tp / td) / (1 - 2 * tp / td);
		var a = 2 * tau / td;
		var S = 1 / (1 - a + (1 + a) * Math.exp(-td / tau));

		return {
			...entry,
			time: time,
			toujeoActivity: (insulin * (S / Math.pow(tau, 2)) * time * (1 - time / td) * Math.exp(-time / tau)) / 60
		};
	});
	console.log('the is the accumulated toujeo activity:', timeSinceToujeoAct);

	// compute the aggregated activity of last toujeos in 27 hours

	let lastToujeos = timeSinceToujeoAct.filter(function (e) {
		return e.time <= 30;
	});
	console.log('these are the last toujeos and activities:', lastToujeos);

	const resultTouAct = lastToujeos.reduce(function (tot, arr) {
		return tot + arr.toujeoActivity;
	}, 0);

	console.log(resultTouAct);


	const TouAct = JSON.stringify(resultTouAct, null, 4);
	// fs.writeFile('./files/last_toujeo_aggrACT.json', TouAct, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	console.log('aggregated TOU activity is now is saved as JSON.');
	// });
	return resultTouAct;
};