function getParametres() {
    return __getParametres(false);
}

function getParametresAndRaiseAlert() {
    return __getParametres(true);
}

function __getParametres(raiseAlert) {
    var parametresLocal = $.cookie('parametres');
	// Récupération des paramètres de l'application
	if (parametresLocal === undefined) {
        if (raiseAlert) {
            noTimeParametres();
        }
        parametresLocal = [];
	} else {
		if (parametresLocal['days'] === undefined) {
			parametresLocal['days'] = 0;
		}
		if (parametresLocal['hours'] === undefined) {
			parametresLocal['hours'] = 0;
		}
		if (parametresLocal['minutes'] === undefined) {
			parametresLocal['minutes'] = 0;
		}
		if (parametresLocal['seconds'] === undefined) {
			parametresLocal['seconds'] = 0;
		}
	}
    return parametresLocal;
}

function getIndicators(date) {
    var indicators = $.cookie('indicators');
    if (indicators === undefined || indicators.length === 0) {
        indicators = {
            'totalTime' : 0,
            'dayRatio' : 0,
            'timeDifference' : 0,
            'date' : date.getTime(),
            'isOverTime' : false,
            'timeEnd' : date.getTime(),
            'corruptedModel' : false
        };
    }
    return indicators;
}

function getPunches() {

}

/**
 * Saves the state and time of the punch
 * @param string check either I or O
 */
function saveCheck(check) {
    // Préparation de l'enregistrement en cookie
    var punch = {
            'check' : check,
            'date' : new Date().getTime()
        };

    var punches = $.cookie('punches');
    if (punches === undefined) {
        punches = [punch];
    }
    else {
        punches.push(punch);
    }

    // Enregistrement du cookie
    $.cookie('punches', punches, {expires : 7});

    $( "#progressbar" ).progressbar( "option", "value", sizeRatio(punches) );
    setPunchesRange(punches);
}

/**
 * Saves the parametres in a cookie as an associative array
 */
function saveParametres() {
    var parametres = {
        'days' : $('#total-time-options #days').val(),
        'hours' : $('#total-time-options #hours').val(),
        'minutes' : $('#total-time-options #minutes').val(),
        'seconds' : $('#total-time-options #seconds').val()
    };
    $.cookie('parametres',parametres, {expires: 7});
    
    // Forces a reset of the estimated end time by setting the date to '' which will force the calculation of the date
    $('#time-end').text('');
}