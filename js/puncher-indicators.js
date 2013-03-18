/**
 * Calcule tous les indicateurs
 * @param date la date courante
 * @param punches les données à partir desquelles calculer
 * @param parametres les paramètres de l'application
 * @param firstCalculation booléen, est-on dans le cas d'un premier calcul?
 * Si oui on force le calcul du temps restant
 * @return an array containing the calculated indicators
 */
function calculateIndicators(date, punches, parametres, firstCalculation, indicatorsMode) {

	var parametresLocal = parametres;
	// Récupération des paramètres de l'application
	if (parametresLocal === undefined) {
		parametresLocal = getParametresAndRaiseAlert();
	}

	var indicators = getIndicators(date);
    
    // Here we create a associative array that will hold all the parameters needed
    // by all the calculation functions in order to simplify the functions signatures
    var calculationParametres = {
        'punches' : punches,
        'parametres' : parametres,
        'indicators' : indicators,
        'currentDate' : date,
        'indicatorsMode' : indicatorsMode
    };
    
    // Fill the number of days worked and time spent since the beginning of punches
    totalTimeMultipleDays(calculationParametres);

    // Fill the time spent
	var totalTimeLocal = totalTime(calculationParametres, date);
	indicators['totalTimeToday'] = isNaN(totalTimeLocal) ? 0 : totalTimeLocal;
    
    // The number of days are based on the number of days present in the punches
    // so if there's no punches today we must increment numberOfDays to reflect the
    // user's reality
    if (indicators['totalTimeToday'] === 0) {
        indicators['numberOfDays']++;
    }
    
    // Fill the time to spend
	var timeDiff = timeDifference(calculationParametres);
	indicators['timeDifference'] = isNaN(timeDiff) ? 0 : timeDiff;
    
    // Fill the ratio of the day spent
	var dayRatio = timeRatio(calculationParametres);
	indicators['dayRatio'] = isNaN(dayRatio) ? 0 : dayRatio;
    
    // Fill the amount of over time
    var overTimeAmount = getOverTimeAmount(calculationParametres);
    indicators['overTimeAmount'] = isNaN(overTimeAmount) ? 0 : overTimeAmount,

	indicators['date'] = date.getTime();
	indicators['isOverTimeForDay'] = indicators['dayRatio'] > 100;
	if (indicators['isOverTimeForDay']) {
		indicators['dayRatio'] -= 100;
	}
    
    var isOverTime = getIsOverTime(calculationParametres);
    indicators['isOverTime'] = isOverTime === undefined ? 0 : isOverTime;

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
 * Calculates the amount of over time since the beginning of punches using the time spent, 
 * the time left to spend and the time supposed to be spent in the day
 * @param parametres the application's parametres
 * @param totalTime the time spent in milleseconds
 * @param timeDiff time left to spend for the day
 * @returns the over time amount or undefined if parametres are undefined
 */
function getOverTimeAmount(calculationParametres) {
    
    var parametres = calculationParametres['parametres'];
    
    if (parametres === undefined) {
        return undefined;
    }
    
    var totalTimeToday = calculationParametres['indicators']['totalTimeToday'];
    var totalTimeEver = calculationParametres['indicators']['totalTimeEver'];
    var numberOfDays = calculationParametres['indicators']['numberOfDays'];

    var timeToSpendNormally = parametres2Ms(parametres);
    
    var overTime = (totalTimeEver - totalTimeToday) - timeToSpendNormally * (numberOfDays - 1);
    
    return overTime < 0 ? 0 : overTime;
}

/**
 * Calculates if the task is over time according to previous overTime entries
 * @param calculationParametres the global parameters (see calculateIndicators)
 */
function getIsOverTime(calculationParametres) {

    var parametres = calculationParametres['parametres'];
    var dayLength = parametres2Ms(parametres);
    var overTimeAmount = calculationParametres['indicators']['overTimeAmount'];
    
    overTimePoint = dayLength - overTimeAmount;

    // Determine at which ratio of the day we're in overTime
    overTimeRatio = __timeRatio(overTimePoint,parametres);
    
    if (calculationParametres['indicators']['dayRatio'] > overTimeRatio) {
        return true;
    } 
    else {
        return false;
    }
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

/**
 * Calculates the time to spend on the task by comparing time to spend and time spent
 * @param totalTime the time spent in milleseconds
 * @param parametres the time to spend encapsulated in the parametres associative array
 * @return the number of milliseconds left to spend on the task
 */
function timeDifferenceFromTotalTime(calculationParametres) {
    
    var parametres = calculationParametres['parametres'];
    var totalTime = calculationParametres['indicators']['totalTimeToday'];
    
	var totalTimeMax = parametres2Ms(parametres);
	return totalTime - totalTimeMax;
}

// TODO: Add doc and tests 4 me
function timeDifferenceMultipleDays(calculationParametres) {

    var parametres = calculationParametres['parametres'];
    var punches = calculationParametres['punches'];

    var totalTimeDifference = 0;
    
    if ( parametres === undefined) {
        return undefined;
    }
    else if (punches !== undefined) {
        var totalTime = calculationParametres['indicators']['totalTimeEver'];
        var totalTimeMax = parametres2Ms(parametres);
        totalTimeMax = totalTimeMax * calculationParametres['indicators']['numberOfDays'];
        totalTimeDifference = totalTime - totalTimeMax;
    }
    
	return totalTimeDifference === 0 ? timeDifferenceFromTotalTime(calculationParametres) : totalTimeDifference;
}

// TODO: add tests 4 me
/**
 * Calculates the time spent and the number of days worked since the beginning of punches. 
 * It Sets the results of its calculation directly in the indicators.
 * @param calculationParametres the global parameters (see calculateIndicators)
 */
function totalTimeMultipleDays(calculationParametres) {

    var punches = calculationParametres['punches'];
    
    var numberOfDaysWorked = 0;
    var totalTimeEver = 0;
    if (punches !== undefined) {
        // For each day between the start and the end of the punches we 
        // calculate the time spent and match it with the time to spend
        // so that we get the time left to spend for all the days combined
        var firstPunchDate = new XDate(punches[0]['date']);
        var now = new XDate();
        var numberOfDays = Math.ceil(firstPunchDate.diffDays(now));
        var numberOfDaysWorked = numberOfDays;
        var totalTimeEver = 0;
        for ( var i = 0 ; i <  numberOfDays ; i++) {
            
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
            
            // Handles the case when a personn didn't check in a day (considered not worked)
            var totalTimeTemp = totalTime(calculationParametres, date);
            if (totalTimeTemp === undefined) {
                numberOfDaysWorked--;
            }
            else {
                totalTimeEver += totalTimeTemp;
            }
        }
    }
    
    calculationParametres['indicators']['numberOfDays'] = numberOfDaysWorked;
    calculationParametres['indicators']['totalTimeEver'] = totalTimeEver;
    
    return totalTimeEver;
}

// TODO: add doc and test 4 me
function timeDifference(calculationParametres) {
    var indicatorsMode = calculationParametres['indicatorsMode'];
    if (indicatorsMode !== undefined && indicatorsMode > 0) {
        return timeDifferenceMultipleDays(calculationParametres);
    }
    else {
        return timeDifferenceFromTotalTime(calculationParametres);
    }
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
 * @param timeDiff the time left
 * @return the ratio in %
 */
function timeRatio(calculationParametres) {

    var totalTime = calculationParametres['indicators']['totalTimeToday'];
    var parametres = calculationParametres['parametres'];
    
    return __timeRatio(totalTime,parametres);
}

function __timeRatio(totalTime,parametres) {

	var maxTime = parametres2Ms(parametres);
	if (maxTime != 0) {
		return totalTime * 100 / maxTime;
	}
	return 100;
}

/**
 * Calculates the total time spent on a given day
 * @param date the day to calculate the totalTime of
 * @param punches the punches
 * @return the total time spent that day
 */
function totalTime(calculationParametres, date) {

    var punches = calculationParametres['punches'];

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
    else {
        workdayLength = undefined;
    }
    
    return workdayLength;
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
 * @param daysPunches the punches of the day
 * @return an associative array representing the last check in of the day
 */
function getLastCheckIn(daysPunches) {

	if (daysPunches === undefined) {
		return undefined;
	}
	daysPunches = daysPunches.reverse();
	return getFirstCheckIn(daysPunches);
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