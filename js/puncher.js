$(document).ready(function(){
	
	$.cookie.json = true;
	
	// Initialisation du bouton
	$(document).everyTime('1s', function() {
	
		var punches = $.cookie('punches');
		
		if (punches != undefined) {
		
			if (punches[punches.length-1]['check'] == 'I') {
			
				if (!$('#button').hasClass('on'))
					$('#button').toggleClass('on');
					
				var lastPunch = punches[punches.length-1]['date'];
				lastPunch = new Date(lastPunch);
				var now = new Date();
				
				var dayStart = new Date();
				dayStart.setHours(0);
				dayStart.setMinutes(0);
				dayStart.setSeconds(0);
				dayStart.setMilliseconds(0);
				
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
				
				var previousPunch;
				var modelCorrupted = false;
				var workdayLength = 0;
				todaysPunches = todaysPunches.reverse();
				
				// Récupération du premier check in de la journée
				do {
					previousPunch = todaysPunches.shift();
				} while (todaysPunches.length > 0 && previousPunch['check'] != 'I');
				
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
				$('#last-time-spent').text(diffDate(now,lastPunch));
				$('#cookie-size').text(sizeRatio(punches));
			}
		}
	});
	
	$('#button').on('click', function(){
		// Modification css
		$(this).toggleClass('on');
		
		// Préparation de l'enregistrement en cookie
		var check = 'O';
		if ($(this).hasClass('on')) {
			check = 'I';
		}
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
	});
});

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