// const fs = require('fs');
module.exports = function ( weight,detemirs) {
	// require('json.date-extensions');
	// JSON.useDateParser();
	// var jsondet = JSON.stringify(detemirs);
	// var detemirs = JSON.parseWithDate(jsondet);
	console.log(detemirs);

	// activities be expressed as U/min !!!
	let timeSinceDetemirAct = detemirs.map(entry => {
		var time = entry.time;
		var insulin = entry.insulin;
		var duration = (14 + (24 * insulin / weight));
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
			detemirActivity: (insulin * (S / Math.pow(tau, 2)) * time * (1 - time / td) * Math.exp(-time / tau)) / 60
		};
	});
	console.log('these are the detemir activities:', timeSinceDetemirAct);

	// compute the aggregated activity of last detemirs in 30 hours

	let lastDetemirs = timeSinceDetemirAct.filter(function (e) {
		return e.time <= 30;
	});
	console.log('these are the last detemirs and activities:', lastDetemirs);

	const resultDetAct = lastDetemirs.reduce(function (tot, arr) {
		return tot + arr.detemirActivity;
	}, 0);

	console.log(resultDetAct);


	const DetAct = JSON.stringify(resultDetAct, null, 4);
	// fs.writeFile('./files/last_detemir_aggrACT.json', DetAct, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	console.log('aggregated DET activity is now is saved as JSON.');
	// });
	return resultDetAct;
};