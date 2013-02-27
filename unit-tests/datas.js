/*####################################################################

                                PUNCHES

####################################################################*/

var twoDaysBeforeMidnight = new XDate();
twoDaysBeforeMidnight.addDays(-2);
twoDaysBeforeMidnight.setHours(0,0,0,0);
var todayMidnight = new XDate();
todayMidnight.setHours(0,0,0,0);
var punchesOk = [
    // Yesterday
    { 'check' : 'I', 'date' : twoDaysBeforeMidnight.setHours(8).getTime()},
    { 'check' : 'O',  'date' : twoDaysBeforeMidnight.setHours(10).getTime() },
    { 'check' : 'I', 'date' : twoDaysBeforeMidnight.setHours(10,10).getTime() },
    { 'check' : 'O', 'date' : twoDaysBeforeMidnight.setHours(12).getTime() },
    { 'check' : 'I', 'date' : twoDaysBeforeMidnight.setHours(13,15).getTime() },
    { 'check' : 'O', 'date' : twoDaysBeforeMidnight.setHours(18).getTime() },
    // Today
    { 'check' : 'I', 'date' : todayMidnight.setHours(9).getTime()},
    { 'check' : 'O',  'date' : todayMidnight.setHours(10).getTime() },
    { 'check' : 'I', 'date' : todayMidnight.setHours(10,10).getTime() },
    { 'check' : 'O', 'date' : todayMidnight.setHours(12).getTime() },
    { 'check' : 'I', 'date' : todayMidnight.setHours(13,15).getTime() }
];

var punchesBroken = [
    // Yesterday
    { 'check' : 'I', 'date' : twoDaysBeforeMidnight.setHours(8).getTime()},
    { 'check' : 'O',  'date' : twoDaysBeforeMidnight.setHours(10).getTime() },
    { 'check' : 'I', 'date' : twoDaysBeforeMidnight.setHours(10,10).getTime() },
    { 'check' : 'I', 'date' : twoDaysBeforeMidnight.setHours(12).getTime() },
    { 'check' : 'I', 'date' : twoDaysBeforeMidnight.setHours(13,15).getTime() },
    { 'check' : 'O', 'date' : twoDaysBeforeMidnight.setHours(18).getTime() },
    // Today
    { 'check' : 'O',  'date' : todayMidnight.setHours(10).getTime() },
    { 'check' : 'I', 'date' : todayMidnight.setHours(9).getTime()},
    { 'check' : 'O', 'date' : todayMidnight.setHours(13,15).getTime() },
    { 'check' : 'I', 'date' : todayMidnight.setHours(10,10).getTime() },
    { 'check' : 'O', 'date' : todayMidnight.setHours(12).getTime() },
    { 'check' : 'O', 'date' : todayMidnight.setHours(17).getTime() },
];

/*####################################################################

                            PARAMETRES

####################################################################*/

// TODO: Faire les tests avec plusieurs jours
var parametres = {
    'days' : 0,
    'hours' : 12,
    'minutes' : 13,
    'seconds' : 48
};

/*####################################################################

                                TIMES

####################################################################*/

var today12 = new Date();
today12.setHours(12,15,0,0);
var today13 = new Date();
today13.setHours(13,0,0,0);
var today23 = new Date();
today23.setHours(23,0,0,0);

var totalTime12 = todaysTotalTime(today12, punchesOk);
var totalTime13 = todaysTotalTime(today13, punchesOk);
var totalTime23 = todaysTotalTime(today23, punchesOk);

var twoDaysBefore12 = new XDate(today12);
twoDaysBefore12.addDays(-2);
var twoDaysBefore13 = new XDate(today13);
twoDaysBefore13.addDays(-2);
var twoDaysBefore23 = new XDate(today23);
twoDaysBefore23.addDays(-2);

var totalTimeTwoDaysBefore12 = totalTime(twoDaysBefore12, punchesOk);
var totalTimeTwoDaysBefore13 = totalTime(twoDaysBefore13, punchesOk);
var totalTimeTwoDaysBefore23 = totalTime(twoDaysBefore23, punchesOk);

var yesterday12 = new XDate(today12);
yesterday12.addDays(-1);
var totalTimeYesterday12 = totalTime(yesterday12, punchesOk);

/*####################################################################

                            INDICATORS

####################################################################*/

var indicators = {
  "date": today12.getTime(),
  "dayRatio": 24.529844644317254,
  "isOverTime": false,
  "timeDifference": -33228000,
  "timeEnd": 1361228472000,
  "totalTime": 10800000,
  "corruptedModel" : false
};

/*####################################################################

                        EXPECTED RESULTS
                        
####################################################################*/

var timeEnd12 = new Date(today12.getTime());
timeEnd12.setHours(21,28,48,0);
var timeEnd13 = new Date(today13.getTime());
timeEnd13.setHours(22,13,48,0);
var timeEnd23 = new Date(today23.getTime());
timeEnd23.setHours(22,28,48,0);

var expectedResult12 = {
  "date": today12.getTime(),
  "dayRatio": 24.529844644317254,
  "isOverTime": false,
  "timeDifference": -33228000,
  "timeEnd": timeEnd12.getTime(),
  "totalTime": 10800000,
  "corruptedModel" : false
};
var expectedResult13 = {
  "date": today13.getTime(),
  "dayRatio": 24.529844644317254,
  "isOverTime": false,
  "timeDifference": -33228000,
  "timeEnd": timeEnd13.getTime(),
  "totalTime": 10800000,
  "corruptedModel" : false
};
var expectedResult23 = {
  "date": today23.getTime(),
  "dayRatio": timeRatio(totalTime23 , parametres) - 100,
  "isOverTime": true,
  "timeDifference": 1872000,
  "timeEnd": timeEnd23.getTime(),
  "totalTime": 45900000,
  "corruptedModel" : false
};
var expectedBrokenResult = {
  "date": today12.getTime(),
  "dayRatio": 0,
  "isOverTime": false,
  "timeDifference": 0,
  "timeEnd": today12.getTime(),
  "totalTime": 0,
  "corruptedModel" : true
}
var expectedBrokenParametres = {
  "corruptedModel": false,
  "date": today12.getTime(),
  "dayRatio": 107900,
  "isOverTime": true,
  "timeDifference": 10790000,
  "timeEnd": 0,
  "totalTime": 10800000
}