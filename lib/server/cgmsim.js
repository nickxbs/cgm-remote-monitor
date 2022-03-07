const main = require('./core/main')
const moment = require('moment')
const surprise = require('./core/surprise')

function init (env, ctx) {

  //   console.log(env, ctx);

  function cgmsim () {
    return cgmsim;
  }
  let job5Minutes;
  let jobHourly;
  let cgmsimEnv = { ISF: 30, CR: 10, DIA: 6, WEIGHT: 90, TP: 75, CARBS_ABS_TIME: 360, isActive: false, ...env.settings };
  let pumpBasals = [];
  let storedPumpBasals = [];

  const PARAMS_TYPE = 'params'
  const PUMPBASALS_TYPE = 'pumpbasals'

  function api () {
    // obtain handle usable for querying the collection associated
    // with these records
    return ctx.store.collection('cgmsim');
  }

  const clearPumpBasals = () => {
    if (pumpBasals && storedPumpBasals && pumpBasals.length > 75) {
      pumpBasals.splice(75, pumpBasals.length - 75)
      api().deleteMany({ type: PUMPBASALS_TYPE }, function(err) {
        if (!err) {
          api().insertMany(pumpBasals, function(error) {
            if (error) {
              console.log('\x1b[31m', 'CGMSIM insertMany pumpBasals: ', pumpBasals, '\x1b[0m');
              console.log('\x1b[31m', 'CGMSIM insertMany error: ', error, '\x1b[0m');
            }
          });
          //clear storedPumpBasals
          storedPumpBasals.splice(0, storedPumpBasals.length - 1);
          storedPumpBasals.push(...pumpBasals);
        }
      })
    }

  }

  const updateParams = (cgmsimEnv, postEnv) => {

    cgmsimEnv.ISF = postEnv.ISF;
    cgmsimEnv.CR = postEnv.CR;
    cgmsimEnv.DIA = postEnv.DIA;
    cgmsimEnv.WEIGHT = postEnv.WEIGHT;
    cgmsimEnv.TP = postEnv.TP;
    cgmsimEnv.CARBS_ABS_TIME = postEnv.CARBS_ABS_TIME;
    cgmsimEnv.pumpEnabled = postEnv.pumpEnabled;
    cgmsimEnv.surpriseEnabled = postEnv.surpriseEnabled;
    cgmsimEnv.planetEnabled = postEnv.planetEnabled;
    cgmsimEnv.isActive = postEnv.isActive;
    saveParams(cgmsimEnv);

  }

  const loadSettings = (cgmsimEnv) => {
    api().findOne({ type: PARAMS_TYPE }, function(err, storedParams) {
      if (storedParams) {
        cgmsimEnv.ISF = storedParams.ISF;
        cgmsimEnv.CR = storedParams.CR;
        cgmsimEnv.DIA = storedParams.DIA;
        cgmsimEnv.WEIGHT = storedParams.WEIGHT;
        cgmsimEnv.TP = storedParams.TP;
        cgmsimEnv.CARBS_ABS_TIME = storedParams.CARBS_ABS_TIME;
        cgmsimEnv.pumpEnabled = storedParams.pumpEnabled;
        cgmsimEnv.surpriseEnabled = storedParams.surpriseEnabled;
        cgmsimEnv.planetEnabled = storedParams.planetEnabled;
        cgmsimEnv.isActive = !storedParams.isActive;
		console.log('\x1b[32m', 'CGMSIM get storedParams: ', storedParams, '\x1b[0m');
        if (storedParams.isActive) {
          cgmsim.start()
        }
      }
    });
    //find pumps
    if (pumpBasals && pumpBasals.length === 0) {
      api().find({ type: PUMPBASALS_TYPE })
        .sort({ date: -1 })
        .limit(100)
        .sort({ date: 1 })
        .project({ _id: 0 })
        .toArray(function(err, storedPumpBasal) {
          if (storedPumpBasal) {
            console.log('\x1b[32m', 'CGMSIM get storedPumpBasal entries: ', storedPumpBasal ? storedPumpBasal.length : null, '\x1b[0m');

            storedPumpBasals.push(...storedPumpBasal);
            pumpBasals.push(...storedPumpBasal);
          }
        });
    }
  }

  const saveParams = (cgmsimEnv) => {
    const { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled, isActive } = cgmsimEnv;

    api().updateOne({ type: PARAMS_TYPE }, { $set: { type: PARAMS_TYPE, ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled, isActive } }, { upsert: true });
  }

  cgmsim.start = function start (postEnv) {
    if (postEnv) {
      updateParams(cgmsimEnv, { ...postEnv, isActive: true });
    }
    // setInterval(() => {
    //   clearPumpBasals();
    // }, 10000)

    if (!cgmsimEnv.isActive) {
      cgmsimEnv.isActive = true;
      saveParams(cgmsimEnv);
      console.log('\x1b[32m', 'CGMSIM Started', '\x1b[0m');

      job5Minutes = setInterval(() => {
        const { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled } = cgmsimEnv;
        console.log('CGMSIM Start', { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled });

        const { sgvs, treatments, profiles } = ctx.ddata;
        const entries = sgvs.sort((a, b) => b.mills - a.mills).map(s => ({ ...s, sgv: s.mgdl }));
        pumpBasals.sort((a, b) => a.date - b.date);

        const newEntry = main({ pumpBasals, entries, treatments, profiles, env: { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled } });
        console.log('\x1b[32m', 'CGMSIM Result: ', JSON.stringify(newEntry), '\x1b[0m')

        pumpBasals.forEach(b => {
          if (!storedPumpBasals.includes(b)) {
            b.type = PUMPBASALS_TYPE;
            api().insertOne({ ...b });
            storedPumpBasals.push(b);
          }
        })

        //save entries
        ctx.entries.create([newEntry], function stored (err) {
          if (err) {
            console.error('\x1b[31m', 'CGMSIM save error: ', err, '\x1b[0m')
          }
        });

      }, 300000);

      jobHourly = setInterval(() => {
        const { surpriseEnabled } = cgmsimEnv;
        console.log('CGMSIM Surprise Start', { surpriseEnabled });

        clearPumpBasals()
        if (moment().hours() === 23) {

          //RUN surpise
          if (surpriseEnabled) {

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
          }
        }
      }, 60000 * 60);
    }
  }

  cgmsim.stop = function start () {
    if (cgmsimEnv.isActive === true) {
      clearInterval(job5Minutes)
      clearInterval(jobHourly)
      cgmsimEnv.isActive = false;
      saveParams(cgmsimEnv);
      console.log('\x1b[31m', 'CGMSIM deactivated', '\x1b[0m')
    }
  }
  cgmsim.get = function start () {
    const { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled, isActive } = cgmsimEnv;
    console.log('CGMSIM GET ', { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled, isActive });
    return { ISF, CR, DIA, WEIGHT, TP, CARBS_ABS_TIME, pumpEnabled, surpriseEnabled, planetEnabled, isActive };
  }
  loadSettings(cgmsimEnv);
  //cgmsim.start();
  return cgmsim();

}

module.exports = init;
