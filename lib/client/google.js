const querystring = require('querystring');
var fetch = require('node-fetch');

function postData (url = '', data = {}) {
  return fetch(url, {
      method: 'POST'
      , cache: 'no-cache'
      , headers: {
        'Content-Type': 'application/json'
      }
      , body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
    .then(response => {
      return response.json(); // parses JSON response into native JavaScript objects
    })
}

function openGoogleSignOut () {
  const host = window.location.origin;
  const url = 'https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=' + host + '/api/v1/cgmsim/close';
  window.open(url, '_blank', "width=800,height=600");
}

function openGoogleSignIn (client_id ,redirect_uri) {

  // generate a url that asks permissions for Blogger and Google Calendar scopes
  const scopes = [
	'https://www.googleapis.com/auth/fitness.activity.read'
	];

  const generateAuthUrl = (opts) => {
    if (opts.code_challenge_method && !opts.code_challenge) {
      throw new Error(
        'If a code_challenge_method is provided, code_challenge must be included.'
      );
    }
    opts.response_type = opts.response_type || 'code';
    opts.client_id = client_id;
    opts.redirect_uri = redirect_uri;
    // opts.code_verifier = '123';
    // Allow scopes to be passed either as array or a string
    if (opts.scope instanceof Array) {
      opts.scope = opts.scope.join(' ');
    }
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    return (
      rootUrl +
      '?' +
      querystring.stringify(opts)
    );
  }

  const url = generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline'
      // , prompt: 'consent'
      // If you only need one scope you can pass it as a string
    , scope: scopes
  });

  window.open(url, '_blank', "width=800,height=600");

}

const getFitSteps = (token, fromMillis, toMillis) => {
  const url = 'https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate';
  const data = {
    aggregateBy: [{
        dataTypeName: "com.google.step_count.delta"
        , dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
		}
	]
    , bucketByTime: { "durationMillis": toMillis - fromMillis }
    , endTimeMillis: toMillis
    , startTimeMillis: fromMillis
  };
  const headers = {
    'Content-Type': 'application/json'
    , 'Authorization': 'Bearer ' + token
  , }
  console.log('@@@Fit data',data)
  console.log('@@@Fit headers',headers)
  return fetch(url, {
      method: 'POST'
      , headers
      , body: JSON.stringify(data)
    })
    .then(res => {
      return res.json();
    })

}

const getRefreshToken = (refresh_token, client_id, client_secret) => {
  const url = 'https://oauth2.googleapis.com/token';
  const data = {
    client_id
    , client_secret
    , refresh_token: refresh_token
    , grant_type: 'refresh_token'
  };
  console.log('data', data);
  return postData(url, data)
}

const getAccesstoken = (code, client_id, client_secret, redirect_uri) => {
  if (code) {
    const url = 'https://oauth2.googleapis.com/token';

    const data = {
      code
      , client_id
      , grant_type: 'authorization_code'
      , client_secret
      , redirect_uri
    };

    return postData(url, data)
  }
}
module.exports = { openGoogleSignIn, openGoogleSignOut, getFitSteps, getRefreshToken, getAccesstoken };
