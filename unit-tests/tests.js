test( "parametres2Ms", function() {
    // Checks raw value
    equal(parametres2Ms(parametres), 166428000);
    // Checks against date in GMT
    equal(parametres2Ms(parametres), new Date("01/02/1970").setHours(22,13,48,000) - (new Date(0).getTimezoneOffset() * 60000));
});

test( "timeDifferenceFromTotalTime", function() {
    equal(timeDifferenceFromTotalTime(parametres2Ms(timeAlmostDone) , parametres), -48000);
    equal(timeDifferenceFromTotalTime(parametres2Ms(timeOverTime) , parametres), 12000);
});

test( "timeRatio", function() {
    equal(timeRatio(parametres2Ms(timeAlmostDone) , parametres), 99.97115869925733);
    equal(timeRatio(parametres2Ms(timeOverTime) , parametres), 100.00721032518567 );
});

test( "todaysTotalTime", function() {
    equal(todaysTotalTime(punchesOk), 25200000);
    equal(todaysTotalTime(punchesBroken), -1);
});

test( "getTodaysPunches", function() {
    deepEqual(getTodaysPunches(punchesOk), punchesOk.slice(6));
    deepEqual(getTodaysPunches(punchesBroken), punchesBroken.slice(6));
});

test( "getFirstCheckIn", function() {
    deepEqual(getFirstCheckIn(getTodaysPunches(punchesOk)), punchesOk[6]);
    deepEqual(getFirstCheckIn(getTodaysPunches(punchesBroken)), punchesBroken[7]);
});

test( "getLastCheckIn", function() {
    deepEqual(getLastCheckIn(getTodaysPunches(punchesOk)), punchesOk[10]);
    deepEqual(getLastCheckIn(getTodaysPunches(punchesBroken)), punchesBroken[9]);
});