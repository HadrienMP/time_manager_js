$(document).ready(function(){
	
	$.cookie.json = true;
	calculateIndicators()
	
	$(document).everyTime('1s', function() {
		calculateIndicators()
	});
	
	$('#button').on('click', function(){
		// Modification css
		$(this).toggleClass('on');
		
		var check = 'O';
		if ($('#button').hasClass('on')) {
			check = 'I';
		}
		saveInCookie(check);
	});
	
	var myplugin;
	if(!myplugin){
		myplugin = $('#p1').cprogress({
		   percent: 0, // starting position
		   img1: '../images/v1.png', // background
		   img2: '../images/v2.png', // foreground
		   speed: 200, // speed (timeout)
		   PIStep : 0.05, // every step foreground area is bigger about this val
		   limit: 100, // end value
		   loop : false, //if true, no matter if limit is set, progressbar will be running
		   showPercent : true, //show hide percent
		   onInit: function(){console.log('onInit');},
		   onProgress: function(p){console.log('onProgress',p);}, //p=current percent
		   onComplete: function(p){console.log('onComplete',p);}
		});
	}
});

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

function calculateIndicators() {

	var punches = $.cookie('punches');
		
	if (punches != undefined) {
		if (punches[punches.length-1]['check'] == 'I') {
		
			// Si le dernier check est un check in on modifie l'aspect du bouton
			if (!$('#button').hasClass('on'))
				$('#button').toggleClass('on');
				
			// Récupération de la date pour les calculs
			var now = new Date();
			
			var todaysPunches = getTodaysPunches(punches);
			
			var previousPunch;
			var modelCorrupted = false;
			var workdayLength = 0;
			
			todaysPunches = todaysPunches.reverse();
			
			var previousPunch = getFirstCheckIn(todaysPunches);
			
			// Calcul du temps passé au travail dans la journée
			var j = 1;
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
			
			$('#time-spent').text(ms2string(workdayLength));
			
			// Récupération du dernier punch
			var lastPunch = punches[punches.length-1]['date'];
			lastPunch = new Date(lastPunch);
			
			$('#last-time-spent').text(diffDate(now,lastPunch));
			
			// Affichage de la taille du cookie par rapport au maximum autorisé
			$('#cookie-size').text(sizeRatio(punches));
		}
	}
}

function getFirstCheckIn(todaysPunches) {
	// Récupération du premier check in de la journée
	do {
		previousPunch = todaysPunches.shift();
	} while (todaysPunches.length > 0 && previousPunch['check'] != 'I');
	return previousPunch;
}

function getTodaysPunches(punches) {

	// Création de la date du jour à minuit (début de la journée)
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

function diffDate(date1, date2) {
	return ms2string(date1 - date2);
}

function ms2string(ms) {

	var s = ms/1000;
	var m = s/60;
	var h = m/60;
	var d = h/24;
	
	mF = Math.floor(m);
	hF = Math.floor(h);
	dF = Math.floor(d);
	
	s = (m - mF)*60;
	m = (h - hF)*60;
	h = (d - dF)*24;
	
	s = Math.floor(s);
	m = Math.floor(m);
	h = Math.floor(h);
	d = Math.floor(d);
	
	var diff = '';
	if (d > 0)
		diff += d + ' days ';
	if (h > 0)
		diff += h + ' h ';
	if (m > 0)
		diff += m + ' min ';
		
	diff += s + ' s';
	
	return  diff;
}

function roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );
            for (var i in value) {
                try {
                    if (i == 'Blob') bytes += value[i].size || 0;
                    stack.push(value[i]);
                    stack.push(i);
                } catch(e) {};
            };
        }
    }
    return bytes;
}

function sizeRatio(object) {
	return (Math.round(roughSizeOfObject(object) * 100 * 100 / 4095) / 100) + ' %';
}