'use strict';

function configure (app, wares, ctx, env) {
  var express = require('express')
    , api = express.Router();

  api.use(wares.compression());

  // text body types get handled as raw buffer stream
  api.use(wares.rawParser);
  // json body types get handled as parsed json
  // also support url-encoded content-type
  api.use(wares.urlencodedParser);

  // invoke common middleware
  api.use(wares.sendJSONStatus);

  api.use(ctx.authorization.isPermitted('api:treatments:read'));
  // List treatments available
  api.get('/cgmsim', function(req, res) {
    const cgmsimParams = ctx.cgmsim.get();
    return res.json(cgmsimParams)
  });

  function config_authed (app, api, wares, ctx) {

    function enable_response (req, res) {
      ctx.cgmsim.start(req.body);
      res.json(true);
    }

    api.post('/cgmsim/', ctx.authorization.isPermitted('api:treatments:create'), enable_response);

    function disable_response (req, res) {
      ctx.cgmsim.stop();
      res.json(true);
    }
    api.delete('/cgmsim/', ctx.authorization.isPermitted('api:treatments:create'), disable_response);
  }

  if (app.enabled('api') && app.enabled('cgmsim')) {
    config_authed(app, api, wares, ctx);
  }

  return api;
}

module.exports = configure;
