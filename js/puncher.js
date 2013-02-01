$(document).ready(function(){
	
	$("#knob").knob({
		"fgColor":"#aaa",
        draw : tronDraw
    });
	
	$.cookie.json = true;
	var punches = $.cookie('punches');
	
	initPage(punches);
	
	$(document).everyTime('1s', function() {
		punches = $.cookie('punches');
		updateIndicators(punches);
	});
	
	$('#button').on('click', function(){
		$(this).toggleClass('on');
		var check = 'O';
		if ($('#button').hasClass('on')) {
			check = 'I';
			$("#knob").trigger('configure', {"fgColor":"#87bb53", "shadow" : true});
		} else {
			$("#knob").trigger('configure', {"fgColor":"#aaa", "shadow" : false});
		}
		saveInCookie(check);
	});
});

function initPage(punches) {
	if (punches != undefined) {
		if (punches[punches.length-1]['check'] == 'I') {
			// Si le dernier check est un check in on modifie l'aspect du bouton
			if (!$('#button').hasClass('on')) {
				$('#button').toggleClass('on');
				$("#knob").trigger('configure', {"fgColor":"#87bb53", "shadow" : true});
			}
			
			calculateIndicators(punches)
		}
	}
}

function saveInCookie(check) {
	// Préparation de l'enregistrement en cookie
	var punch = {
			'check' : check,
			'date' : new Date().getTime()
		};
		
	var punches = $.cookie('punches');
	if (punches == undefined) {
		punches = [punch];
	}
	else {
		punches.push(punch);
	}

	// Enregistrement du cookie
	$.cookie('punches', punches, {expires : 7});
}

function updateIndicators(punches) {
	if (punches != undefined) {
		if (punches[punches.length-1]['check'] == 'I') {			
			calculateIndicators(punches)
		}
	}
	
}

function calculateIndicators(punches) {
		
	// Récupération de la date pour les calculs
	var now = new Date();
	
	var todaysPunches = getTodaysPunches(punches);
	
	var previousPunch;
	var modelCorrupted = false;
	var workdayLength = 0;
	
	var todaysPunchesTimeSpent = todaysPunches.reverse();
	var todaysPunchesLastCheckIn = todaysPunchesTimeSpent.slice(0);
	
	var previousPunch = getFirstCheckIn(todaysPunchesTimeSpent);
	
	// Calcul du temps passé au travail dans la journée
	var j = 1;
	if (todaysPunchesTimeSpent.length == 0) {
		workdayLength += now.getTime() - previousPunch['date'];
	} else {
		for (var index in todaysPunchesTimeSpent) {
			punch = todaysPunchesTimeSpent[index];
			if (previousPunch['check'] == punch['check']) {
				modelCorrupted = true;
				break;
			}
			if (punch['check'] == 'O' && previousPunch['check'] == 'I') {
				workdayLength += punch['date'] - previousPunch['date'];
			}
			else if (todaysPunchesTimeSpent.length == j && punch['check'] == 'I') {
				workdayLength += now.getTime() - punch['date'];
			}
			j++;
			previousPunch = punch;
		}
	}
	
	$('#time-spent').text(ms2string(workdayLength));
	
	// Récupération du dernier punch
	var lastPunch = getLastCheckIn(todaysPunchesLastCheckIn);
	if (lastPunch != undefined) {
		lastPunchDate = new Date(lastPunch['date']);
		$('#last-time-spent').text(diffDate(now,lastPunchDate));
	} else {
		$('#last-time-spent').text("0 s");
	}	
	
	// Affichage de la taille du cookie par rapport au maximum autorisé
	$('#cookie-size').text(sizeRatio(punches));
	
	var indicators = {
		'dayRatio' : workdayLength * 100 / (7 * 60 *60 * 1000 + 22 * 60 * 1000)
	}
	
	$("#knob").val(Math.round(indicators['dayRatio'])).trigger('change');
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

