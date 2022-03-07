const perlinRun = require('./perlin');
// const downloadsRun = require('./downloads.js');
const computeBolusIRun = require('./computeBolusIOB.js');
const computeBasalIOBRun = require('./computeBasalIOB.js');
const detemirRun = require('./detemir.js');
const glargineRun = require('./glargine.js');
const degludecRun = require('./degludec.js');
const toujeoRun = require('./toujeo.js');
const allMealsRun = require('./all_meals.js');
const carbsRun = require('./carbs.js');
const arrowsRun = require('./arrows.js');
const liverRun = require('./liver.js');

//
// const downloadSgv1Run = require('./download_sgv1.js');
const sgvStartRun = require('./sgv_start.js');

console.log('Run Init');
let perls = perlinRun();

const main = ({ env, entries, treatments, profiles, pumpBasals }) => {
  const weight = parseInt(env.WEIGHT);
if(!perls || perls.length===0){
	perls = perlinRun();
}
  const { resultAct } = computeBolusIRun({ treatments }, env);
  const { lastDET, lastGLA, lastTOU, lastDEG } = computeBasalIOBRun(entries);
  const det = detemirRun(weight, lastDET);
  const gla = glargineRun(weight, lastGLA);
  const degludec = degludecRun(weight, lastDEG);
  const tou = toujeoRun(weight, lastTOU);
  const lastMeals = allMealsRun(treatments);
  const carbs = carbsRun(env, lastMeals);
  const liver = liverRun(env);
  // await downloadSgv1Run();
  const cgmsim = sgvStartRun({
    entries
    , det
    , gla
    , degludec
    , tou
    , liver
    // , arrows
    , carbs
    , resultAct
    , perls
    , profiles
    , pumpBasals
	, treatments
  , }, env);
  console.log('this is the new sgv:', cgmsim);
  const arrows = arrowsRun([cgmsim, ...entries]);
  cgmsim.direction = arrows[0].direction;
  return cgmsim;
  //return uploadCgmsimRun(cgmsim, env);
};

module.exports = main;
// 0 */6 * * * cd /home/MYUSERNAME/cgmsim && /bin/bash perlin.sh
// */5 * * * * cd /home/MYUSERNAME/cgmsim && /bin/bash get-all.sh
// */5 * * * * cd /home/MYUSERNAME/cgmsim && /bin/bash upload-cgmsim.sh
// #30 23 * * * cd /home/MYUSERNAME/cgmsim && /bin/bash surprise.sh
// 0 */1 * * * cd /home/MYUSERNAME/cgmsim && /bin/bash planets.sh

// console.log('job', job);
// run();
