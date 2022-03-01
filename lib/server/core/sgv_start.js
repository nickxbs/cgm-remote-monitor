//require('dotenv').config();
var moment = require('moment');
// var fs = require('fs');
//var pump = require('./pump.js');

const sgv_start = ({
  entries
  , det
  , gla
  , degludec
  , tou
  , liver
  , arrows
  , carbs
  , resultAct
  , perls
, }, env) => {

  const deltaMinutes = 5;
  //console.log(sgvValues);

  const ISF = parseInt(env.ISF); //mmol/l/U
  //console.log('ISF=', ISF);

  // ENABLE THIS FOR PUMP SIMULATION
  //=================================

  const pumpBasalAct = 0;
  // const pumpBasalAct = await pump({
  // 	entries,
  // 	profile,
  // }) ;

  let globalBasalAct = gla + det + tou + degludec; //
  let globalMealtimeAct = resultAct; //

  let globlalInsulinAct = globalBasalAct + globalMealtimeAct + pumpBasalAct;

  let BGI_ins = (globlalInsulinAct * deltaMinutes * ISF) * -1;

  var today = new Date();

  const liver_bgi = liver * deltaMinutes;

  var timeSincePerlin = perls.map(entry => ({
    ...entry
    , time: (Date.now() - moment(entry.time).valueOf()) / (1000 * 60)
  }));

  let lastPerls = timeSincePerlin.filter(function(e) {
    return e.time >= 0 && e.time <= 5; // keep only the latest noise value
  });

  var oldSgv = entries && entries[0] ? entries[0].sgv : 90;
  var sgv_pump = Math.floor(oldSgv + (BGI_ins * 18) + (liver_bgi * 18) + (carbs * 18) + (lastPerls[0].noise * 18 * 6));
  var limited_sgv_pump = sgv_pump;
  if (sgv_pump >= 400) {
    limited_sgv_pump = 400;
  } else if (sgv_pump <= 40) {
    limited_sgv_pump = 40;
  }
  var dict = {
    dateString: today
    , sgv: limited_sgv_pump
    , type: 'sgv'
    , direction: arrows[0].direction
    , date: Date.now()
  , };

  console.log('-------------------------------------------');
  console.log('glaAct:', gla, 'detAct:', det, 'touAct', tou, 'degAct', degludec, 'total basal act:', globalBasalAct);
  //write('glaAct: ' + gla + 'detAct: ' + det + 'touAct: ' + tou + 'degAct: ' + degludec + 'total basal act: ' + globalBasalAct);
  console.log('-------------------------------------------');
  console.log('total mealtime insulin activity:', globalMealtimeAct);
  //write('total mealtime insulin activity: ' + globalMealtimeAct);
  console.log('-------------------------------------------');
  console.log('total insulin activity:', globlalInsulinAct);
  //write('total insulin activity: ' + globlalInsulinAct);

  console.log('-------------------------------------------');
  console.log('total BG impact of insulin for 5 minutes:', BGI_ins, 'mg/dl');
  //write('total BG impact of insulin for 5 minutes: ' + BGI_ins, 'mg/dl');
  // console.log('total BG impact of insulin for 5 minutes:', BGI_ins / 18, 'mmol/l');

  console.log('-------------------------------------------');
  console.log('total BG impact of liver for 5 minutes: +', liver_bgi * 18, 'mg/dl');
  //write('total BG impact of liver for 5 minutes: +' + (liver_bgi * 18) + ' mg/dl');

  console.log('-------------------------------------------');
  console.log('total CARBS impact of carbs for 5 minutes: +', carbs * 18, 'mg/dl');
  //write('total CARBS impact of carbs for 5 minutes: +' + (carbs * 18) + ' mg/dl');

  console.log('-------------------------------------------');
  console.log('total BG impact of carbs, liver and insulin for 5 minutes: +', (BGI_ins) + (liver_bgi * 18) + (carbs * 18), 'mg/dl');
  //write('total BG impact of carbs, liver and insulin for 5 minutes: +' + ((BGI_ins) + (liver_bgi * 18) + (carbs * 18)) + ' mg/dl');

  console.log('today: ', today);
  //write('today: ' + today);

  console.log('this is the old sgv:', oldSgv);
  //write('this is the old sgv: ' + sgvValues[0].sgv);

  console.log('this is the pump basal insulin activity:', pumpBasalAct);
  //write('this is the pump basal insulin activity: ' + pumpBasalAct);

  //write('this is the NEW sgv: ' + dict.sgv);

  return dict;
};

module.exports = sgv_start;
