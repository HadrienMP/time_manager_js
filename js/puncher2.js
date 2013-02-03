$(document).ready(function(){
	
    initPuncher();
    
    $('#button').click(function(){
		$(this).toggleClass('on');
		if ($(this).hasClass('on')) powerOn();
		else powerOff();
	});
});

function initPuncher() {
	$.cookie.json = true;
	$("#knob").knob({
		"fgColor":"#aaa",
        draw : tronDraw
    });
	$( "#progressbar" ).progressbar();
	$('#tabs-container').accordion();
}

/**
 * Turns the puncher's power on
 */
function powerOn() {
	// Changes the color of the progress bar
	$("#knob").trigger('configure', {"fgColor":"#87bb53", "shadow" : true});
	
	// Regular update of the progress bar and indicators
	$(document).everyTime('1s', 'puncherTimer', function() {
		console.log('Is Timing...');
	});
	// Save the state
	saveInCookie('I');
}

/**
 * Turns the puncher's power off
 */
function powerOff() {
	// Changes the color of the progress bar
	$("#knob").trigger('configure', {"fgColor":"#aaa", "shadow" : false});
	// Stops the update of the progress bar
	$(document).stopTime('puncherTimer');
	// Save the state
	saveInCookie('O');
}

/**
 * Saves the state and time of the punch
 * @param string check either I or O
 */
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
	
	$( "#progressbar" ).progressbar( "option", "value", sizeRatio(punches) );
}