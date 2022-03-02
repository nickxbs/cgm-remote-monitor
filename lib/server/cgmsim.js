const main = require('./core/main')

function init (env, ctx) {

  //   console.log(env, ctx);

  function cgmsim () {
    return cgmsim;
  }
  let job;
  let active = false;
  let cgmsimEnv = { ISF: 30, CR: 10, DIA: 6, WEIGHT: 90, TP: 75, CARBS_ABS_TIME: 360, ...env.settings };

  cgmsim.start = function start (postEnv) {
    cgmsimEnv = { ...cgmsimEnv, ...postEnv };
    console.log('CGMSIM Ready', JSON.stringify(cgmsimEnv));

    if (active === false) {
      job = setInterval(() => {
        const { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME } = cgmsimEnv;
        console.log('CGMSIM Start', { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME });
        const { sgvs, treatments, profile } = ctx.ddata;
        const newEntry = main({ entries: sgvs.sort((a,b)=>b.mills-a.mills).map(s => ({ ...s, sgv: s.mgdl })), treatments, profile, env: { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME } });
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
  cgmsim.get = function start () {
    if (active === true) {
		const { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME } = cgmsimEnv;
      return { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME };
    }
  }
  cgmsim.start();
  return cgmsim();
}

module.exports = init;
