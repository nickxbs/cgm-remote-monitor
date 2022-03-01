'use strict';

var Storages = require('js-storage');

function init (client, $) {
  var cgmsim = {};

  var translate = client.translate;
  var storage = Storages.localStorage;


  function maybePrevent (event) {
    if (event) {
      event.preventDefault();
    }
  }


  cgmsim.save = function save (event) {
    confirmPost();
    maybePrevent(event);
  };

  function confirmPost (data) {
          postTreatment(data);
  }

  function postTreatment (data) {

    $.ajax({
      method: 'POST'
      , url: '/api/v1/cgmsim/'
      , headers: client.headers()
      , data: data
    }).done(function treatmentSaved (response) {
      console.info('treatment saved', response);
    }).fail(function treatmentSaveFail (response) {
      console.info('treatment saved', response);
      alert(translate('Entering record failed') + '. ' + translate('Status') + ': ' + response.status);
    });

    storage.set('enteredBy', data.enteredBy);

    client.browserUtils.closeDrawer('#cgmsimDrawer');
  }

  cgmsim.toggleDrawer = function toggleDrawer (event) {
    client.browserUtils.toggleDrawer('#cgmsimDrawer');
    maybePrevent(event);
  };

  $('#cgmsimDrawerToggle').click(cgmsim.toggleDrawer);
  $('#cgmsimDrawer').find('button').click(cgmsim.save);
  $('#eventTime').find('input:radio').change(cgmsim.eventTimeTypeChange);

  $('.eventinput').focus(cgmsim.dateTimeFocus).change(cgmsim.dateTimeChange);

  return cgmsim;
}

module.exports = init;
