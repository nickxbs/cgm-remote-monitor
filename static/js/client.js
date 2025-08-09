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
				localStorage.setItem(event.data.key, event.data.value);
				console.log(`Set ${event.data.key} = ${event.data.value}`);

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
