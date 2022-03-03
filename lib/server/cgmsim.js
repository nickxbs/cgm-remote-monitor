const main = require('./core/main')
const surprise = require('./core/surprise')

function init (env, ctx) {

  //   console.log(env, ctx);

  function cgmsim () {
    return cgmsim;
  }
  let jobSgv;
  let jobSurprise;
  let active = false;
  let cgmsimEnv = { ISF: 30, CR: 10, DIA: 6, WEIGHT: 90, TP: 75, CARBS_ABS_TIME: 360, ...env.settings };
  let pumpBasals = [];
  cgmsim.start = function start (postEnv) {
    if (postEnv) {
      cgmsimEnv.ISF = postEnv.ISF;
      cgmsimEnv.CR = postEnv.CR;
      cgmsimEnv.DIA = postEnv.DIA;
      cgmsimEnv.WEIGHT = postEnv.WEIGHT;
      cgmsimEnv.TP = postEnv.TP;
      cgmsimEnv.CARBS_ABS_TIME = postEnv.CARBS_ABS_TIME;
      cgmsimEnv.pumpEnabled = postEnv.pumpEnabled;
      cgmsimEnv.surpriseEnabled = postEnv.surpriseEnabled;
      cgmsimEnv.planetEnabled = postEnv.planetEnabled;
    }
    setInterval(() => {
      //   console.log('\x1b[32m', '------------------ctx.ddata', ctx.ddata.treatments, '\x1b[0m')

    }, 10000)

    if (active === false) {
      console.log('\x1b[32m', 'CGMSIM Started', '\x1b[0m')

      jobSgv = setInterval(() => {
        const { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled } = cgmsimEnv;
        console.log('CGMSIM Start', { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled });

        const { sgvs, treatments, profiles } = ctx.ddata;
        const entries = sgvs.sort((a, b) => b.mills - a.mills).map(s => ({ ...s, sgv: s.mgdl }));
        pumpBasals.sort((a, b) => a.date - b.date);

        const newEntry = main({ pumpBasals, entries, treatments, profiles, env: { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled } });

        console.log('\x1b[32m', 'CGMSIM Result: ', JSON.stringify(newEntry), '\x1b[0m')

        //save entries
        ctx.entries.create([newEntry], function stored (err) {
          if (err) {
            console.error('\x1b[31m', 'CGMSIM save error: ', err, '\x1b[0m')
          }
        });
      }, 300000);

      jobSurprise = setInterval(() => {
        const { surpriseEnabled } = cgmsimEnv;
        console.log('CGMSIM Surprise Start', { surpriseEnabled });

        const { treatments } = ctx.ddata;
        treatments.sort((a, b) => b.created_at - a.created_at);

        const newSurprise = surprise({ treatments });

        console.log('\x1b[32m', 'CGMSIM Surprise Result: ', JSON.stringify(newSurprise), '\x1b[0m')

        //save entries
        if (newSurprise) {
          ctx.treatments.create([newSurprise], function stored (err) {
            if (err) {
              console.error('\x1b[31m', 'CGMSIM surprise save error: ', err, '\x1b[0m')
            }
          });

        }
      }, 60000 * 60);

      //   const newEntry = main({ entries, treatments, profile, env: cgmsimEnv });
      //   console.log('CGMSIM Result: ', JSON.stringify(newEntry))
      active = true;
    }
  }

  cgmsim.stop = function start () {
    if (active === true) {
      clearInterval(jobSgv)
      clearInterval(jobSurprise)
      active = false;
      console.log('\x1b[31m', 'CGMSIM deactivated', '\x1b[0m')
    }
  }
  cgmsim.get = function start () {
    if (active === true) {
      const { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled } = cgmsimEnv;
      console.log('CGMSIM GET ', { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled });
      return { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled };
    }
  }
  cgmsim.start();
  return cgmsim();
}

module.exports = init;
