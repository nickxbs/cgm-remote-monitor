var moment = require('moment');
// const fs = require('fs');
module.exports = ({
	treatments
},env) => {
	//require('json.date-extensions');
	//JSON.useDateParser();

	// const entries = fs.readFileSync('./files/entries.json');
	//var json = JSON.stringify(entries);

	// var entries =entries;
	//console.log(entries);

	let insulin = treatments.filter(e => e.insulin && e.drug === 'hum').map(e => ({
		time: e.created_at,
		insulin: e.insulin
	}));
	console.log('this is the filtered treatments (insulin):', insulin);
	console.log('length', insulin.length); // returns the number of boluses or lenghth of the array

	// dia is the duration of insulin action in hours
	var dia = parseInt(env.DIA);
	// td is the total duration of insulin action in minutes
	var td = dia * 60;
	// tp is the time to the peak insulin action in minutes
	var tp = parseInt(env.TP);



	var tau = tp * (1 - tp / td) / (1 - 2 * tp / td);
	var a = 2 * tau / td;
	var S = 1 / (1 - a + (1 + a) * Math.exp(-td / tau));

	const timeSinceBolusMin = insulin.map(entry => ({
		...entry,
		time: (Date.now() - moment(entry.time).valueOf()) / (1000 * 60)
	}));
	console.log('this is the trimmed down insulin and time since injection data:', timeSinceBolusMin);

	let timeSinceBolusAct = insulin.map(entry => {
		var t = (Date.now() - moment(entry.time).valueOf()) / (1000 * 60);
		var insulin = entry.insulin;
		return {
			...entry,
			time: t,
			activityContrib: insulin * (S / Math.pow(tau, 2)) * t * (1 - t / td) * Math.exp(-t / tau),
			iobContrib: insulin * (1 - S * (1 - a) * ((Math.pow(t, 2) / (tau * td * (1 - a)) - t / tau - 1) * Math.exp(-t / tau) + 1))
		};
	});
	//console.log(timeSinceBolusAct);

	let lastInsulins = timeSinceBolusAct.filter(function (e) {
		return e.time <= 300;
	});
	console.log('these are the last insulins and activities:', lastInsulins);

	var resultAct = lastInsulins.reduce(function (tot, arr) {
		return tot + arr.activityContrib;
	}, 0);
	var resultIob = lastInsulins.reduce(function (tot, arr) {
		return tot + arr.iobContrib;
	}, 0);

	//console.log(resultAct, resultIob);


	const dataMealtimearr = [resultAct, resultIob];
	const dataMealtime = JSON.stringify(dataMealtimearr, null, 4);
	// fs.writeFile('./files/last_mealtime.json', dataMealtime, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	console.log('JSON mealtime insulin data is saved.');
	// });
	return {
		resultAct,
		resultIob
	};

};