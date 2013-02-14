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
    { 'check' : 'I', 'date' : todayMidnight.setHours(13,15) },
    { 'check' : 'O', 'date' : todayMidnight.setHours(17) },
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

var parametres = {
    'days' : 1,
    'hours' : 22,
    'minutes' : 13,
    'seconds' : 48
};

/*####################################################################

                                TIMES

####################################################################*/

var timeAlmostDone = {
    'days' : 1,
    'hours' : 22,
    'minutes' : 13,
    'seconds' : 0
};

var timeOverTime = {
    'days' : 1,
    'hours' : 22,
    'minutes' : 14,
    'seconds' : 0
};