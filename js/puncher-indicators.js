function calculateIndicators(punches) {
	var indicators = [];
	// Sécurisation si le contenu du cookie est vide
	if (punches == undefined) {
		indicators['totalTime'] = 0;
		indicators['dayRatio'] = 0;
	} else {
		var totalTime = todaysTotalTime(punches);
		indicators['totalTime'] = totalTime;
		indicators['dayRatio'] = totalTime * 100 / (7 * 60 *60 * 1000 + 22 * 60 * 1000);
	}
	return indicators;
}

function todaysTotalTime(punches) {

	var now = new Date();
	var todaysPunches = getTodaysPunches(punches);
	todaysPunches = todaysPunches.reverse();
	var modelCorrupted = false;
	var workdayLength = 0;

	// Calcul du temps passé au travail dans la journée
	var previousPunch = getFirstCheckIn(todaysPunches);
	if (previousPunch != undefined) {
		
		var j = 1;
		if (todaysPunches.length == 0) {
			workdayLength += now.getTime() - previousPunch['date'];
		} else {
			for (var index in todaysPunches) {
				punch = todaysPunches[index];
				if (previousPunch['check'] == punch['check']) {
					modelCorrupted = true;
					break;
				}
				if (punch['check'] == 'O' && previousPunch['check'] == 'I') {
					workdayLength += punch['date'] - previousPunch['date'];
				}
				else if (todaysPunches.length == j && punch['check'] == 'I') {
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
	// Récupération du premier check in de la journée
	var firstCheckIn;
	do {
		firstCheckIn = todaysPunches.shift();
	} while (todaysPunches.length > 0 && firstCheckIn['check'] != 'I');
	
	if (firstCheckIn != undefined && firstCheckIn['check'] != 'I')
		firstCheckIn = undefined;
		
	return firstCheckIn;
}

function getLastCheckIn(todaysPunches) {
	todaysPunches = todaysPunches.reverse();
	return getFirstCheckIn(todaysPunches);
}

function getTodaysPunches(punches) {

	// Création de la date du jour é minuit (début de la journée)
	var dayStart = new Date();
	dayStart.setHours(0);
	dayStart.setMinutes(0);
	dayStart.setSeconds(0);
	dayStart.setMilliseconds(0);
			
	// Récupération dans le cookie des punches du jour
	var i = 0;
	var tempPunch;
	var todaysPunches = [];
	while (i < punches.length) {
		i++;
		tempPunch = punches[punches.length-i]
		punchDate = new Date(tempPunch['date']);
		if (punchDate < dayStart) {
			break;
		}
		todaysPunches.push(tempPunch);
	}
	return todaysPunches;
}