// const fs = require('fs');
const fetch = require('node-fetch');
const download = async (env) => {
  const {
    getParams
  } = require('./setupParams')(env);

  const api_url = env.NIGHTSCOUT_URL + '/api/v1/treatments';
  const api_profile = env.NIGHTSCOUT_URL + '/api/v1/profile.json';
  const api_sgv = env.NIGHTSCOUT_URL + '/api/v1/entries/sgv.json';

  const treatments = await fetch(api_url, getParams)
    .then(resTreatments => resTreatments.json())
    .catch(err => console.log(err));

  const profile = await fetch(api_profile, getParams)
    .then(resProfile => resProfile.json());

  let entries = await fetch(api_sgv, getParams)
    .then(resSGV => resSGV.json());
  const _entries = entries && entries.length > 4 ? entries : [{ sgv: 90 }, { sgv: 90 }, { sgv: 90 }, { sgv: 90 }];

  return {
    treatments
    , profile
    , entries:_entries
  };
};
module.exports = download;