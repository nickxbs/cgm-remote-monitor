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

  function postCgmsim (data) {

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

    //client.browserUtils.closeDrawer('#cgmsimDrawer');
  }

  function deleteCgmsim () {

    $.ajax({
      method: 'delete'
      , url: '/api/v1/cgmsim/'
      , headers: client.headers()

    }).done(function(response) {
      console.info('cgmsim stopped', response);
    }).fail(function(response) {
      console.info('cgmsim stopped', response);
      alert(translate('cgmsim record failed') + '. ' + translate('Status') + ': ' + response.status);
    });

    //client.browserUtils.closeDrawer('#cgmsimDrawer');
  }

  function getCgmsim (done) {
    $.ajax({
      method: 'get'
      , url: '/api/v1/cgmsim/'
      , headers: client.headers()

    }).done(function(response) {
      done(response)
    }).fail(function(response) {
      alert(translate('cgmsim record failed') + '. ' + translate('Status') + ': ' + response.status);
      done(null)
    });

    //client.browserUtils.closeDrawer('#cgmsimDrawer');
  }

  function confirmPost (data) {
    postCgmsim(data);
  }

  function confirmDelete () {
    deleteCgmsim();
  }

  cgmsim.start = function(event) {

    var data = {
      ISF: parseInt($('#isfGiven').val())
      , CR: parseInt($('#crGiven').val())
      , DIA: parseInt($('#diaGiven').val())
      , WEIGHT: parseInt($('#weightGiven').val())
      , TP: parseInt($('#tpGiven').val())
      , CARBS_ABS_TIME: parseInt($('#catGiven').val())
      , pumpEnabled: $('#pumpEnabledGiven').is(":checked")
      , surpriseEnabled: $('#surpriseGiven').is(":checked")
      , planetEnabled: $('#planetGiven').is(":checked")
    };
    storage.set('cgmsimData', data);

    confirmPost(data);
    maybePrevent(event);
  };
  cgmsim.stop = function(event) {
    confirmDelete();
    maybePrevent(event);
  };

  cgmsim.prepare = function prepare () {
    getCgmsim((data) => {
      const { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled } = data || {};
      $('#isfGiven').val(ISF || 30);
      $('#crGiven').val(CR || 10);
      $('#diaGiven').val(DIA || 6);
      $('#weightGiven').val(WEIGHT || 90);
      $('#tpGiven').val(TP || 75);
      $('#catGiven').val(CARBS_ABS_TIME || 360);

      $('#pumpEnabledGiven').prop('checked', pumpEnabled || false);
      $('#surpriseGiven').prop('checked', surpriseEnabled || false);
      $('#planetGiven').prop('checked', planetEnabled || false);

    })
    return;
  };

  cgmsim.toggleDrawer = function toggleDrawer (event) {
    maybePrevent(event);
    client.browserUtils.toggleDrawer('#cgmsimDrawer', cgmsim.prepare);
  };

  $('#cgmsimDrawerToggle').click(cgmsim.toggleDrawer);
  $('#enableCgmsim').click(cgmsim.start);
  $('#disableCgmsim').click(cgmsim.stop);

  return cgmsim;
}

module.exports = init;
