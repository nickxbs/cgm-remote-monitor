'use strict';

$(document).on('online', function () {
	console.log('Application got online event, reloading');
	window.location.reload();
});

$(document).ready(function () {
	console.log('Application got ready event');
	window.Nightscout.client.init();

	window.addEventListener('message', (event) => {
		console.log('Received message from:', event.origin);
		if (
			event.origin === null ||
			event.origin.includes('localhost') ||
			event.origin.endsWith('cgmsim.com')
		) {
			if (event.data.type === 'SET_STORAGE') {
				event.data.values.forEach((e) => {
					localStorage.setItem(e.key, e.value);
					console.log(`Set ${e.key} = ${e.value}`);
				});

				// Reload the page after setting storage
				window.location.reload();
			}
			if (event.data.type === 'RELOAD') {
				window.location.reload();
			}
		}
		return;
	});
});
