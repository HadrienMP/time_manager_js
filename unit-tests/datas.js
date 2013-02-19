/*####################################################################

                                PUNCHES

####################################################################*/

var yesterdayMidnight = new Date();
yesterdayMidnight.setDate(yesterdayMidnight.getDate() -1)
yesterdayMidnight.setHours(0,0,0,0);
var todayMidnight = new Date();
todayMidnight.setHours(0,0,0,0);
var punchesOk = [
    // Yesterday
    { 'check' : 'I', 'date' : yesterdayMidnight.setHours(8)},
    { 'check' : 'O',  'date' : yesterdayMidnight.setHours(10) },
    { 'check' : 'I', 'date' : yesterdayMidnight.setHours(10,10) },
    { 'check' : 'O', 'date' : yesterdayMidnight.setHours(12) },
    { 'check' : 'I', 'date' : yesterdayMidnight.setHours(13,15) },
    { 'check' : 'O', 'date' : yesterdayMidnight.setHours(18) },
    // Today
    { 'check' : 'I', 'date' : todayMidnight.setHours(9)},
    { 'check' : 'O',  'date' : todayMidnight.setHours(10) },
    { 'check' : 'I', 'date' : todayMidnight.setHours(10,10) },
    { 'check' : 'O', 'date' : todayMidnight.setHours(12) },
    { 'check' : 'I', 'date' : todayMidnight.setHours(13,15) }
];

var punchesBroken = [
    // Yesterday
    { 'check' : 'I', 'date' : yesterdayMidnight.setHours(8)},
    { 'check' : 'O',  'date' : yesterdayMidnight.setHours(10) },
    { 'check' : 'I', 'date' : yesterdayMidnight.setHours(10,10) },
    { 'check' : 'I', 'date' : yesterdayMidnight.setHours(12) },
    { 'check' : 'I', 'date' : yesterdayMidnight.setHours(13,15) },
    { 'check' : 'O', 'date' : yesterdayMidnight.setHours(18) },
    // Today
    { 'check' : 'O',  'date' : todayMidnight.setHours(10) },
    { 'check' : 'I', 'date' : todayMidnight.setHours(9)},
    { 'check' : 'O', 'date' : todayMidnight.setHours(13,15) },
    { 'check' : 'I', 'date' : todayMidnight.setHours(10,10) },
    { 'check' : 'O', 'date' : todayMidnight.setHours(12) },
    { 'check' : 'O', 'date' : todayMidnight.setHours(17) },
];

/*####################################################################

                            PARAMETRES

####################################################################*/

// TODO Faire les tests avec plusieurs jours
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