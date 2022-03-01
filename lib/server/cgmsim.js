const main = require('./core/main')

function init (env, ctx) {

  //   console.log(env, ctx);

  function cgmsim () {
    return cgmsim;
  }
  let job;
  let active = false;
  let cgmsimEnv = { ISF: 30, CR: 10, DIA: 6, WEIGHT: 90, TP: 75, CARBS_ABS_TIME: 360, ...env };

  cgmsim.start = function start (postEnv) {
    cgmsimEnv = { ...cgmsimEnv, ...postEnv };
    console.log('CGMSIM Start', postEnv);
    if (active === false) {
      const { entries, treatments, profile } = ctx.ddata;
      console.log('CGMSIM Ready', JSON.stringify({ entries }));
      job = setInterval(() => {
        console.log('CGMSIM Run');
        const newEntry = main({ entries, treatments, profile, env: cgmsimEnv });
        console.log('CGMSIM Result: ', JSON.stringify(newEntry))
        ctx.entries.create([newEntry], function stored (err) {
          if (err) {
            console.error('CGMSIM save error: ', err);
          }
        });
      }, 300000);
      //   const newEntry = main({ entries, treatments, profile, env: cgmsimEnv });
      //   console.log('CGMSIM Result: ', JSON.stringify(newEntry))
      active = true;
    }
  }

  cgmsim.stop = function start () {
    if (active === true) {
      clearInterval(job)
    }
  }
  cgmsim.start();
  return cgmsim();
}

module.exports = init;
