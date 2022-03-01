module.exports = function (env) {

	const headers = {
		'Content-Type': 'application/json',
		'api-secret': env.API_SECRET_HASH
	};
	return {
		getParams: {
			method: 'GET',
			headers,
			//agent,
		},
		postParams: {
			method: 'POST',
			headers,
			//agent,
		},
	};
};