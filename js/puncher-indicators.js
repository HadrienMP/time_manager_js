function calculateIndicators(punches, parametres) {
	var indicators = [];
	
	// Récupération des paramètres de l'application
	if (parametres === undefined) {
		noTimeParametres();
	}
	else {
		if (parametres['days'] === undefined) {
			parametres['days'] = 0;
		}
		if (parametres['hours'] === undefined) {
			parametres['hours'] = 0;
		}
		if (parametres['minutes'] === undefined) {
			parametres['minutes'] = 0;
		}
		if (parametres['seconds'] === undefined) {
			parametres['seconds'] = 0;
		}
	}
	
	// S�curisation si le contenu du cookie est vide
	if (punches === undefined || parametres === undefined) {
		indicators['totalTime'] = 0;
		indicators['dayRatio'] = 0;
		indicators['timeDifference'] = 0;
		indicators['isOverTime'] = false;
	} else {
		var totalTime = todaysTotalTime(punches);
		indicators['totalTime'] = isNaN(totalTime) ? 0 : totalTime;
		indicators['dayRatio'] = timeRatio(indicators['totalTime'], parametres);
		indicators['timeDifference'] = timeDifference(indicators['totalTime'], parametres);
		indicators['isOverTime'] = indicators['dayRatio'] > 100;
		if (indicators['isOverTime']) {
			indicators['dayRatio'] -= 100;
		}
	}
	return indicators;
}

function timeDifference(totalTime, parametres) {
	var totalTimeMax = parametres2Ms(parametres);
	return totalTime - totalTimeMax;
}

function parametres2Ms(parametres) {
	var ms = parametres['days'] * 24 * 60 * 60 * 1000;
	ms += parametres['hours'] * 60 * 60 * 1000;
	ms += parametres['minutes'] * 60 * 1000;
	ms += parametres['seconds'] * 1000;
	return ms;
}

function timeRatio(totalTime,parametres) {
	var divider = parametres2Ms(parametres);
	if (divider != 0) {
		return totalTime * 100 / divider
	}
	return 0;
}

function todaysTotalTime(punches) {

    var now = new Date();
    var todaysPunches = getTodaysPunches(punches);
    todaysPunches = todaysPunches.reverse();
    var modelCorrupted = false;
    var workdayLength = 0;

    // Calcul du temps pass� au travail dans la journ�e
    var previousPunch = getFirstCheckIn(todaysPunches);
    if (previousPunch !== undefined) {

        var j = 1;
        if (todaysPunches.length === 0) {
            workdayLength += now.getTime() - previousPunch['date'];
        } else {
            for (var index in todaysPunches) {
                punch = todaysPunches[index];
                if (previousPunch['check'] === punch['check']) {
                    modelCorrupted = true;
                    break;
                }
                if (punch['check'] === 'O' && previousPunch['check'] === 'I') {
                    workdayLength += punch['date'] - previousPunch['date'];
                }
                else if (todaysPunches.length === j && punch['check'] === 'I') {
                    workdayLength += now.getTime() - punch['date'];
                }
                j++;
                previousPunch = punch;
            }
        }
        return workdayLength;
    }
}

function getFirstCheckIn(todaysPunches) {
    // R�cup�ration du premier check in de la journ�e
    var firstCheckIn;
    do {
        firstCheckIn = todaysPunches.shift();
    } while (todaysPunches.length > 0 && firstCheckIn['check'] !== 'I');

    if (firstCheckIn !== undefined && firstCheckIn['check'] !== 'I') {
        firstCheckIn = undefined;
    }

    return firstCheckIn;
}

function getLastCheckIn(todaysPunches) {
    todaysPunches = todaysPunches.reverse();
    return getFirstCheckIn(todaysPunches);
}

function getTodaysPunches(punches) {

    // Cr�ation de la date du jour � minuit (d�but de la journ�e)
    var dayStart = new Date();
    dayStart.setHours(0);
    dayStart.setMinutes(0);
    dayStart.setSeconds(0);
    dayStart.setMilliseconds(0);

    // R�cup�ration dans le cookie des punches du jour
    var i = 0;
    var tempPunch;
    var todaysPunches = [];
    while (i < punches.length) {
        i++;
        tempPunch = punches[punches.length-i];
        punchDate = new Date(tempPunch['date']);
        if (punchDate < dayStart) {
            break;
        }
        todaysPunches.push(tempPunch);
    }
    return todaysPunches;
}