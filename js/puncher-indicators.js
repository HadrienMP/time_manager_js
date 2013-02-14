function calculateIndicators(punches, parametres, firstCalculation) {
	
    var parametresLocal = parametres;
	// Récupération des paramètres de l'application
	if (parametresLocal === undefined) {
        parametresLocal = getParametresAndRaiseAlert();
    }
	
    var totalTime = 0;
	// S�curisation si le contenu du cookie est vide
	if (punches !== undefined && parametresLocal !== undefined) {
        totalTime = todaysTotalTime(punches);
	}
    
	var indicators = getIndicators();
    
    indicators['totalTime'] = isNaN(totalTime) ? 0 : totalTime;
    indicators['dayRatio'] = timeRatio(totalTime, parametresLocal);
    indicators['timeDifference'] = timeDifferenceFromTotalTime(totalTime, parametresLocal);
    indicators['date'] = new Date().getTime();
    indicators['isOverTime'] = indicators['dayRatio'] > 100;
    if (indicators['isOverTime']) {
        indicators['dayRatio'] -= 100;
    }
    
    // The estimate end time is calculated in this method only on first calculation
    if (firstCalculation) {
        indicators['timeEnd'] = estimateEndTime(indicators['timeDifference'], punches);
    }
    
    $.cookie('indicators',indicators);
    
	return indicators;
}

function estimateEndTime(punches) {
    var indicators = $.cookie('indicators');
    var timeDifference = indicators['timeDifference'];
    if (timeDifference === undefined) {
        timeDifference = parametres2Ms($.cookie('parametres'));
    }
    // Here we substract the time difference because it is supposed to be negative like 3 hours left = -3h
    
    indicators['timeEnd'] = new Date().getTime() - timeDifference;
    return indicators['timeEnd'];
}

// TODO complete this function 
/**
 * This method calculates the number of breaks and their length the personn does a day.
 * With these informations, the time difference could be calculated more accurately than
 * just the time to spend minus the time spent
 * @param punches the list of punches
 * @return an associative array containing the average number of breaks a day and their length
 */
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

/**
 * Calculates the time to spend on the task by comparing time to spend and time spent
 * @param totalTime the time spent in milleseconds
 * @param parametres the time to spend encapsulated in the parametres associative array
 * @return the number of milliseconds left to spend on the task
 */
function timeDifferenceFromTotalTime(totalTime, parametres) {
	var totalTimeMax = parametres2Ms(parametres);
	return totalTime - totalTimeMax;
}

/**
 * Calculates the time left to spend on the task by comparing time to spend, 
 * time spent, and integrating the predicted time of break for the day
 * @param totalTime the time spent in milliseconds
 * @param punches the list of all the punches to calculate the predicted time of break
 * @param parametres the time to spend encapsulated in the parametres associative array
 * @return the number of milliseconds left to spend on the task
 */
function timeDifferenceTotal(totalTime, punches, parametres) {
    // TODO complete me
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