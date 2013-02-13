function calculateIndicators(punches, parametres, firstCalculation) {
	var indicators = [];
	
    var parametresLocal = parametres;
	// Récupération des paramètres de l'application
	if (parametresLocal === undefined) {
		noTimeParametres();
        parametresLocal = [];
	}
	else {
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
	
    var totalTime = 0;
	// S�curisation si le contenu du cookie est vide
	if (punches !== undefined && parametresLocal !== undefined) {
        totalTime = todaysTotalTime(punches);
	}
    
    // var totalTime = todaysTotalTime(punches);
    indicators['totalTime'] = isNaN(totalTime) ? 0 : totalTime;
    indicators['dayRatio'] = timeRatio(indicators['totalTime'], parametresLocal);
    indicators['timeDifference'] = timeDifference(indicators['totalTime'], parametresLocal);
    
    // The estimate end time is calculated in this method only on first calculation
    if (firstCalculation) {
        indicators['timeEnd'] = estimateEndTime(indicators['timeDifference'], punches);
    } else {
        indicators['timeEnd'] = -1;
    }
    
    indicators['isOverTime'] = indicators['dayRatio'] > 100;
    if (indicators['isOverTime']) {
        indicators['dayRatio'] -= 100;
    }
	//}
	return indicators;
}

function estimateEndTime(timeDifference, punches) {
    // Here we substract the time difference because it is supposed to be negative like 3 hours left = -3h
    return new Date().getTime() - timeDifference;
}

function averageBreakTime(punches) {
    var localPunches = punches.slice();
    var breakTimes = [];
    var lastPunch = localPunches.shift();
    
    // Calcul des temps de pause et du nombre de pauses par jour
    for (var index in localPunches) {
    
        // On ne fait des statistiques que sur les jours passés
        if (new Date(localPunches[index]['date']).getDate() === new Date().getDate()) {
            break;
        }
        
        var day = new Date(localPunches[index]['date']).getDate();
        
        // Si le dernier check est un check out que le check courant est un check in alors on est dans une pause
        // Mais on est dans une pause uniquement si le check in et le check out sont dans la même journée.
        if (lastPunch['check'] === 'O' 
                && localPunches[index]['check'] === 'I'
                && new Date(lastPunch['date']).getDate() === day) {
            breakTimes[day]['totalBreakTime'] += localPunches[index]['date'] - lastPunch['date'];
            breakTimes[day]['totalBreaks'] += 1;
        }
    }
    
    var averageBreaksPerDay = 0;
    var averageBreakTimePerDay = 0;
    for (var key in breakTimes) {
        
    }
    
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