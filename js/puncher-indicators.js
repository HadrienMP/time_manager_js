/**
 * Calcule tous les indicateurs
 * @param date la date courante
 * @param punches les données à partir desquelles calculer
 * @param parametres les paramètres de l'application
 * @param firstCalculation booléen, est-on dans le cas d'un premier calcul?
 * Si oui on force le calcul du temps restant
 * @return an array containing the calculated indicators
 */
function calculateIndicators(date, punches, parametres, firstCalculation) {

	var parametresLocal = parametres;
	// Récupération des paramètres de l'application
	if (parametresLocal === undefined) {
		parametresLocal = getParametresAndRaiseAlert();
	}

	var indicators = getIndicators(date);

	var totalTime = totalTime = todaysTotalTime(date, punches);
	var dayRatio = timeRatio(totalTime, parametresLocal);
	var timeDiff = timeDifference(totalTime, parametresLocal, punches, true);

	indicators['totalTime'] = isNaN(totalTime) ? 0 : totalTime;
	indicators['dayRatio'] = isNaN(dayRatio) ? 0 : dayRatio;
	indicators['timeDifference'] = isNaN(timeDiff) ? 0 : timeDiff;
	indicators['date'] = date.getTime();
	indicators['isOverTime'] = indicators['dayRatio'] > 100;
	if (indicators['isOverTime']) {
		indicators['dayRatio'] -= 100;
	}

	// The estimate end time is calculated in this method only on first calculation
	if (firstCalculation) {
		var timeEnd = estimateEndTime(date, punches, parametres, indicators);
		indicators['timeEnd'] = isNaN(timeEnd) ? 0 : timeEnd;
	}

	// If any of those indicators are undefined it meens the model is having a problem$
	if (totalTime === undefined || dayRatio === undefined || timeDiff === undefined) {
		indicators['corruptedModel'] = true;
	} else {
		indicators['corruptedModel'] = false;
	}

	$.cookie('indicators', indicators);

	return indicators;
}

/**
 * Calculate the estimated time of end
 * @param date the current time
 * @param punches the application's data
 * @param parametres the application's parametres
 * @param indicators the indicators
 * @return the estimated time of End or undefined if a problem occured
 */
function estimateEndTime(date, punches, parametres, indicators) {
	// Condition de sortie
	if (date === undefined) {
		return undefined;
	}

	var timeDifference;
	if (indicators === undefined) {	
		
		var parametresLocal = parametres;
		// Récupération des paramètres de l'application
		if (parametresLocal === undefined) {
			parametresLocal = getParametresAndRaiseAlert();
		}
		
		timeDifference = parametres2Ms(parametresLocal);
		
	} else {
		timeDifference = indicators['timeDifference']
	}
	// Here we substract the time difference because it is supposed to be negative like 3 hours left = -3h
    var endTime = date.getTime() - timeDifference
	return isNaN(endTime) ? undefined : endTime;
}

// TODO: complete this function
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
		if (lastPunch['check'] === 'O' && localPunches[index]['check'] === 'I' && new Date(lastPunch['date']).getDate() === day) {
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
	totalTime = isNaN(totalTime) ? 0 : totalTime;
	return totalTime - totalTimeMax;
}

function timeDifferenceMultipleDays(parametres, punches) {

    if (punches === undefined || parametres === undefined) {
        return undefined;
    }

    // For each day between the start and the end of the punches we 
    // calculate the time spent and match it with the time to spend
    // so that we get the time left to spend for all the days combined
    var firstPunchDate = new XDate(punches[0]['date']);
    var now = new XDate();
    var totalTimeDifference = 0;
    
    for ( var i = 0 ; i < Math.ceil(firstPunchDate.diffDays(now)) ; i++) {
        
        // Get the date to get the time spent
        var date = firstPunchDate.clone();
        date.addDays(i);
        
        // If the date is not today we set the time to before midnight
        // because if the personn forgot to punch out we have to count 
        // the time spent between the punch in and the end of the day
        // TODO: Handle the bug when the person didn't punch in
        // Should it calculate until midnight or until check out the next day?
        if (date.getDate() !== now.getDate()) {
            date.setHours(23,59,59,999);
        }
        else {
            date = now.clone();
        }
        
        var daysTotalTime = totalTime(date, punches);
        totalTimeDifference += timeDifferenceFromTotalTime(daysTotalTime, parametres);
    }
    
	return totalTimeDifference;
}

// TODO: add doc and test 4 me
function timeDifference(totalTime, parametres, punches, multipleDays) {
    if (multipleDays !== undefined && multipleDays) {
        return timeDifferenceMultipleDays(parametres, punches);
    }
    else {
        return timeDifferenceFromTotalTime(totalTime, parametres);
    }
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
	// TODO: complete me
}

/**
 * Transforms the parametres associative array into ms time
 * @param parametres the parametres to transform
 * @return the time in ms
 */
function parametres2Ms(parametres) {
	var ms = parametres['days'] * 24 * 60 * 60 * 1000;
	ms += parametres['hours'] * 60 * 60 * 1000;
	ms += parametres['minutes'] * 60 * 1000;
	ms += parametres['seconds'] * 1000;
	return ms;
}

/**
 * Calculates the ratio between the time spent and time to spend
 * @param totalTime the time spent
 * @param parametres the associative array that represents the time to spend
 * @return the ratio in %
 */
function timeRatio(totalTime, parametres) {
	var divider = parametres2Ms(parametres);
	if (divider != 0) {
		return totalTime * 100 / divider
	}
	return 0;
}

/**
 * Calculates the total time spent on a given day
 * @param date the day
 * @param punches the punches
 * @return the total time spent that day
 */
function totalTime(date, punches) {

	if (date === undefined) {
		date = new Date();
	}
	if (punches === undefined) {
		return undefined;
	}

	var now = date;
	var daysPunches = getDaysPunches(punches, date);
	var workdayLength = 0;

	var previousPunch = getFirstCheckIn(daysPunches);
	if (previousPunch !== undefined) {

		var j = 1;
		// TODO: This case shouldn't be happening
		if (daysPunches.length === 0) {
			workdayLength += now.getTime() - previousPunch['date'];
		} else {
			for (var index in daysPunches) {

				var punch = daysPunches[index];

				// If those conditions are met then the data model is corrupted
				if (previousPunch['check'] === punch['check'] || previousPunch['date'] > punch['date']) {
					// TODO: transform -1 into a constant
					workdayLength = undefined;
					break;
				}
                // Check out after a check in
                if (punch['check'] === 'O' && previousPunch['check'] === 'I') {
                    workdayLength += punch['date'] - previousPunch['date'];
                } else if (daysPunches.length === j && punch['check'] === 'I') {
                    workdayLength += now.getTime() - punch['date'];
                }
				j++;
				previousPunch = punch;
			}
		}
	}
    
    return workdayLength;
}

/**
 * Calulates the total time spent on the task in the day
 * @param date now
 * @param punches the list of punches
 * @return the time spent in ms or undefined if the model is corrupted
 */
function todaysTotalTime(date, punches) {

	if (date === undefined) {
		date = new Date();
	}
	if (punches === undefined) {
		return undefined;
	}

	var now = date;
	var todaysPunches = getDaysPunches(punches);
	var workdayLength = 0;

	var previousPunch = getFirstCheckIn(todaysPunches);
	if (previousPunch !== undefined) {

		var j = 1;
		// TODO: This case shouldn't be happening
		if (todaysPunches.length === 0) {
			workdayLength += now.getTime() - previousPunch['date'];
		} else {
			for (var index in todaysPunches) {

				var punch = todaysPunches[index];

				// If those conditions are met then the data model is corrupted
				if (previousPunch['check'] === punch['check'] || previousPunch['date'] > punch['date']) {
					// TODO: transform -1 into a constant
					workdayLength = undefined;
					break;
				}
				// If the date is inferior to the punch date something is not right
				if (punch['date'] <= now.getTime()) {
					// Check out after a check in
					if (punch['check'] === 'O' && previousPunch['check'] === 'I') {
						workdayLength += punch['date'] - previousPunch['date'];
					} else if (todaysPunches.length === j && punch['check'] === 'I') {
						workdayLength += now.getTime() - punch['date'];
					}
				}
				j++;
				previousPunch = punch;
			}
		}
		return workdayLength;
	}
}

/**
 * Finds the first check in of punches
 * @param daysPunches the punches of the day
 * @return an associative array representing the first check in of the day
 */
function getFirstCheckIn(daysPunches) {

	if (daysPunches === undefined) {
		return undefined;
	}

	// R�cup�ration du premier check in de la journ�e
	var firstCheckIn;
	do {
		firstCheckIn = daysPunches.shift();
	} while (daysPunches.length > 0 && firstCheckIn['check'] !== 'I');

	if (firstCheckIn !== undefined && firstCheckIn['check'] !== 'I') {
		firstCheckIn = undefined;
	}

	return firstCheckIn;
}

/**
 * Gets the last check in of the punches
 * @param todaysPunches the punches of the day
 * @return an associative array representing the last check in of the day
 */
function getLastCheckIn(todaysPunches) {

	if (todaysPunches === undefined) {
		return undefined;
	}
	todaysPunches = todaysPunches.reverse();
	return getFirstCheckIn(todaysPunches);
}

/**
 * Finds the punches that were maid on a specific date
 * @param punches the list of all the punches
 * @param date date to get the punches
 * @return the fraction of punches that contains the punches maid today
 */
function getDaysPunches(punches, date) {
    if (punches === undefined) {
		return undefined;
	}

	// Cr�ation de la date du jour � minuit (d�but de la journ�e)
	var dayStart = new Date();
    if (date !== undefined) {
        dayStart = new XDate(date);
    }
	dayStart.setHours(0,0,0,0);
    var dayEnd = new Date(dayStart);
    dayEnd.setHours(23,59,59,999);

	// R�cup�ration dans le cookie des punches du jour
	var i = 0;
	var tempPunch;
	var todaysPunches = [];
	while (i < punches.length) {
		i++;
		tempPunch = punches[punches.length - i];
		var punchDate = new Date(tempPunch['date']);
        if (punchDate > dayEnd) {
            continue;
        }
		if (punchDate < dayStart ) {
			break;
		}
		todaysPunches.push(tempPunch);
	}
	return todaysPunches.reverse();
}

/**
 * Finds the punches that were maid today
 * @param punches the list of all the punches
 * @return the fraction of punches that contains the punches maid today
 */
function getTodaysPunches(punches) {

	if (punches === undefined) {
		return undefined;
	}

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
		tempPunch = punches[punches.length - i];
		var punchDate = new Date(tempPunch['date']);
		if (punchDate < dayStart) {
			break;
		}
		todaysPunches.push(tempPunch);
	}
	return todaysPunches.reverse();
}