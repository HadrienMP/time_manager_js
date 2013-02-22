$.cookie.json = true;

test( "parametres2Ms", function() {
    // Checks against date in GMT
    equal(parametres2Ms(parametres), new Date("01/01/1970").setHours(12,13,48,000) - (new Date(0).getTimezoneOffset() * 60000));
});

test( "todaysTotalTime", function() {
    equal(totalTime12, 10800000);
    equal(totalTime12, totalTime13);
    equal(totalTime23, 45900000);
    equal(todaysTotalTime(today12, punchesBroken), undefined);
    equal(todaysTotalTime(today12, undefined), undefined);
});

test( "timeDifferenceFromTotalTime", function() {
    equal(timeDifferenceFromTotalTime(totalTime12 , parametres), -33228000);
    equal(timeDifferenceFromTotalTime(totalTime13 , parametres), -33228000);
    equal(timeDifferenceFromTotalTime(totalTime23 , parametres), 1872000);
});

test( "timeRatio", function() {
    equal(timeRatio(totalTime12 , parametres), 24.529844644317254);
    equal(timeRatio(totalTime13 , parametres), 24.529844644317254);
    equal(timeRatio(totalTime23 , parametres), 104.25183973834832);
});

test( "getTodaysPunches", function() {
    deepEqual(getTodaysPunches(punchesOk), punchesOk.slice(6));
    deepEqual(getTodaysPunches(punchesBroken), punchesBroken.slice(6));
    deepEqual(getTodaysPunches(undefined), undefined);
});

test( "getFirstCheckIn", function() {
    deepEqual(getFirstCheckIn(getTodaysPunches(punchesOk)), punchesOk[6]);
    deepEqual(getFirstCheckIn(getTodaysPunches(punchesBroken)), punchesBroken[7]);
    equal(getFirstCheckIn(undefined), undefined);
});

test( "getLastCheckIn", function() {
    deepEqual(getLastCheckIn(getTodaysPunches(punchesOk)), punchesOk[10]);
    deepEqual(getLastCheckIn(getTodaysPunches(punchesBroken)), punchesBroken[9]);
    equal(getLastCheckIn(undefined), undefined);
});

test( "estimateEndTime", function() {
    equal(estimateEndTime(today12, punchesOk, parametres), today12.getTime() - parametres2Ms(parametres));
    equal(estimateEndTime(today12, punchesOk, parametres, indicators), today12.getTime() - indicators['timeDifference']);
    equal(estimateEndTime(today12, punchesOk, undefined, indicators), undefined);
    equal(estimateEndTime(today12, punchesOk, undefined), undefined);
    equal(estimateEndTime(today12, undefined, undefined), undefined);
});

test( "calculateIndicators", function() {

    // Nominal cases
    deepEqual(calculateIndicators(today12, punchesOk, parametres, true), expectedResult12);
    $.removeCookie('indicators');
    deepEqual(calculateIndicators(today13, punchesOk, parametres, true), expectedResult13);
    $.removeCookie('indicators');
    deepEqual(calculateIndicators(today23, punchesOk, parametres, true), expectedResult23);
    $.removeCookie('indicators');
    expectedResult12['timeEnd'] = 0;
    deepEqual(calculateIndicators(today12, punchesOk, parametres, false), expectedResult12);
    $.removeCookie('indicators');
    
    // Broken punches
    deepEqual(calculateIndicators(today12, punchesBroken, parametres, true), expectedBrokenResult);
    $.removeCookie('indicators');
    expectedBrokenResult['timeEnd'] = 0;
    deepEqual(calculateIndicators(today12, punchesBroken, parametres, false), expectedBrokenResult);
    $.removeCookie('indicators');
    deepEqual(calculateIndicators(today12, punchesBroken, undefined, false), expectedBrokenResult);
    
    // Broken parametres
    deepEqual(calculateIndicators(today12, punchesOk, undefined, false), expectedBrokenParametres);    
});