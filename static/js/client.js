'use strict';

$(document).on('online', function () {
	console.log('Application got online event, reloading');
	window.location.reload();
});

$(document).ready(function () {
	console.log('Application got ready event');
	window.Nightscout.client.init();

	window.addEventListener('message', (event) => {
		if (!event.origin.endsWith('cgmsim.com')) return;
		if (event.data.type === 'SET_STORAGE') {
			localStorage.setItem(event.data.key, event.data.value);
			console.log(`Set ${event.data.key} = ${event.data.value}`);

			event.source.postMessage(
				{
					type: 'STORAGE_SET_SUCCESS',
					key: event.data.key,
				},
				event.origin,
			);
		}
	});
});
