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

    storage.set('enteredBy', data.enteredBy);

    client.browserUtils.closeDrawer('#cgmsimDrawer');
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

    client.browserUtils.closeDrawer('#cgmsimDrawer');
  }

  function confirmPost (data) {
    postCgmsim(data);
  }

  function confirmDelete () {
    deleteCgmsim();
  }

  cgmsim.start = function(event) {
    var data = {
      ISF: $('#isfGiven').val()
      , CR: $('#crGiven').val()
      , DIA: $('#diaGiven').val()
      , WEIGHT: $('#weightGiven').val()
      , TP: $('#tpGiven').val()
      , CARBS_ABS_TIME: $('#catGiven').val()
    };

    confirmPost(data);
    maybePrevent(event);
  };
  cgmsim.stop = function(event) {
    confirmDelete();
    maybePrevent(event);
  };

  cgmsim.prepare = function prepare () {
    $('#isfGiven').val(30);
    $('#crGiven').val(10);
    $('#diaGiven').val(6);
    $('#weightGiven').val(90);
    $('#tpGiven').val(75);
    $('#catGiven').val(360);
  };

  cgmsim.toggleDrawer = function toggleDrawer (event) {
    client.browserUtils.toggleDrawer('#cgmsimDrawer', cgmsim.prepare);
    maybePrevent(event);
  };

  $('#cgmsimDrawerToggle').click(cgmsim.toggleDrawer);
  $('#enableCgmsim').click(cgmsim.start);
  $('#disableCgmsim').click(cgmsim.stop);

  return cgmsim;
}

module.exports = init;
