var parametres = {
    'days' : 1,
    'hours' : 22,
    'minutes' : 13,
    'seconds' : 48
};

test( "parametres2Ms", function() {

    // Checks raw value
    equal(parametres2Ms(parametres), 166428000);
    
    // Checks against date in GMT
    equal(parametres2Ms(parametres), new Date("01/02/1970").setHours(22,13,48,000) - (new Date(0).getTimezoneOffset() * 60000));
});


test( "timeDifferenceFromTotalTime", function() {

    var totalTime = {
        'days' : 1,
        'hours' : 22,
        'minutes' : 13,
        'seconds' : 0
    }

    equal(timeDifferenceFromTotalTime(parametres2Ms(totalTime) , parametres), -48000);
    
    totalTime['minutes'] = 14;
    equal(timeDifferenceFromTotalTime(parametres2Ms(totalTime) , parametres), 12000);
});