var moment = require('moment');
// const fs = require('fs');
//require('json.date-extensions');
//JSON.useDateParser();
module.exports = function (entries) {
	//console.log(entries);

	let meal = entries.filter(e => e.carbs).map(e => ({
		time: e.created_at,
		carbs: e.carbs
	}));
	console.log('this is the filtered meals (carbs):', meal);
	console.log('length', meal.length); // returns the number of meals or lenghth of the array

	const meals = meal.map(entry => ({
		...entry,
		time: moment(entry.time).valueOf()
	}));
	const timeSinceMealMin = meals.map(entry => ({
		...entry,
		mills: entry.time,
		time: (Date.now() - moment(entry.time).valueOf()) / (1000 * 60)
	}));
	console.log('this is the trimmed down meals and time since last meal:', timeSinceMealMin);

	// this is for the calculations of carbs ingestion
	let lastMeals = timeSinceMealMin.filter(function (e) {
		return e.time <= 360; // keep only the meals from the last 6 hours or 360 min
	});
	console.log('these are the last meals: ', lastMeals);

	const dataMeals = JSON.stringify(lastMeals, null, 4);

	// fs.writeFile('./files/last_meals.json', dataMeals, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	console.log('JSON meals data is saved.');
	// });

	// this is added only for the generation of surprise meals, counted on the amount of carbs in the previous 24h
	let lastMeals24 = timeSinceMealMin.filter(function (e) {
		return e.time <= 1440; // keep only the meals from the last 24 hours or 1440 min
	});
	console.log('these are the last meals: ', lastMeals24);

	const dataMeals24 = JSON.stringify(lastMeals24, null, 4);

	// fs.writeFile('./files/last_meals24.json', dataMeals24, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	console.log('JSON meals 24h data is saved.');
	// });
	return lastMeals24;
};