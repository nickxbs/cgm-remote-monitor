'use strict';

function configure (app, wares, ctx) {
  console.log(app)
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

  api.get('/cgmsim/close', function(req, r) {
    r.set('Content-Type', 'text/html');
    r.send('<html><head><script>window.close()</script></head><body>Test</body></html>');
  })
  api.get('/cgmsim/auth_token', function(req, r) {
    const code = req.query.code;
    ctx.cgmsim.accessToken(code).then(() => {
      r.set('Content-Type', 'text/html');
      r.send('<html><head><script>window.close()</script></head><body>Test</body></html>');
    });

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
