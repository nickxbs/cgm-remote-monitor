// const fs = require('fs');
module.exports = function (weight, degludecs) {

	// var jsondeg = JSON.stringify(degludecs);
	// var degludecs = JSON.parseWithDate(jsondeg);
	console.log(degludecs);

	// activities be expressed as U/min !!!
	let timeSinceDegludecAct = degludecs.map(entry => {
		var time = entry.time;
		var insulin = entry.insulin;
		var duration = 42;
		var peak = (duration / 3);
		var tp = peak;
		var td = duration;

		var tau = tp * (1 - tp / td) / (1 - 2 * tp / td);
		var a = 2 * tau / td;
		var S = 1 / (1 - a + (1 + a) * Math.exp(-td / tau));


		return {
			...entry,
			time: time,
			insulin: insulin,
			degludecActivity: (insulin * (S / Math.pow(tau, 2)) * time * (1 - time / td) * Math.exp(-time / tau)) / 60
		};
	});
	console.log('these are the degludec activities:', timeSinceDegludecAct);

	// compute the aggregated activity of last degludecs in 45 hours

	let lastDegludecs = timeSinceDegludecAct.filter(function (e) {
		return e.time <= 45;
	});
	console.log('these are the last degludecs and activities:', lastDegludecs);

	var resultDegAct = lastDegludecs.reduce(function (tot, arr) {
		return tot + arr.degludecActivity;
	}, 0);

	console.log(resultDegAct);

	
	const DegAct = JSON.stringify(resultDegAct, null, 4);
	// fs.writeFile('./files/last_degludec_aggrACT.json', DegAct, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	console.log('aggregated DEG activity is now is saved as JSON.');
	// });
	return resultDegAct;
};