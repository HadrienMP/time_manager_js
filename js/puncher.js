$(document).ready(function(){
	
	$.cookie.json = true;

	var punches = $.cookie('punches');
		
	if (punches != undefined) {
		calculateIndicators(punches);
	}
	
	$(document).everyTime('1s', function() {
		punches = $.cookie('punches');
		updateIndicators(punches);
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
	
	$("#knob").knob({
        /*change : function (value) {
            //console.log("change : " + value);
        },
        release : function (value) {
            console.log("release : " + value);
        },
        cancel : function () {
            console.log("cancel : " + this.value);
        },*/
        draw : function () {

            // "tron" case
            if(this.$.data('skin') == 'tron') {

                var a = this.angle(this.cv)  // Angle
                    , sa = this.startAngle          // Previous start angle
                    , sat = this.startAngle         // Start angle
                    , ea                            // Previous end angle
                    , eat = sat + a                 // End angle
                    , r = 1;

                this.g.lineWidth = this.lineWidth;

                this.o.cursor
                    && (sat = eat - 0.3)
                    && (eat = eat + 0.3);

                if (this.o.displayPrevious) {
                    ea = this.startAngle + this.angle(this.v);
                    this.o.cursor
                        && (sa = ea - 0.3)
                        && (ea = ea + 0.3);
                    this.g.beginPath();
                    this.g.strokeStyle = this.pColor;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                    this.g.stroke();
                }

                this.g.beginPath();
                this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
                this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                this.g.stroke();

                this.g.lineWidth = 2;
                this.g.beginPath();
                this.g.strokeStyle = this.o.fgColor;
                this.g.arc( this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                this.g.stroke();

                return false;
            }
        }
    });
});

function saveInCookie(check) {
	// Pr�paration de l'enregistrement en cookie
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
			// Si le dernier check est un check in on modifie l'aspect du bouton
			if (!$('#button').hasClass('on'))
				$('#button').toggleClass('on');
			
			calculateIndicators(punches)
		}
	}
	
}

function calculateIndicators(punches) {
		
	// R�cup�ration de la date pour les calculs
	var now = new Date();
	
	var todaysPunches = getTodaysPunches(punches);
	
	var previousPunch;
	var modelCorrupted = false;
	var workdayLength = 0;
	
	todaysPunches = todaysPunches.reverse();
	
	var previousPunch = getFirstCheckIn(todaysPunches);
	
	// Calcul du temps pass� au travail dans la journ�e
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
	
	// R�cup�ration du dernier punch
	var lastPunch = punches[punches.length-1]['date'];
	lastPunch = new Date(lastPunch);
	
	$('#last-time-spent').text(diffDate(now,lastPunch));
	
	// Affichage de la taille du cookie par rapport au maximum autoris�
	$('#cookie-size').text(sizeRatio(punches));
	
	var indicators = {
		'dayRatio' : workdayLength * 100 / (7 * 60 *60 * 1000 + 22 * 60 * 1000)
	}
	
	$("#knob").val(Math.round(indicators['dayRatio'])).trigger('change');
}

function getFirstCheckIn(todaysPunches) {
	// R�cup�ration du premier check in de la journ�e
	do {
		previousPunch = todaysPunches.shift();
	} while (todaysPunches.length > 0 && previousPunch['check'] != 'I');
	return previousPunch;
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