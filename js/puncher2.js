$(document).ready(function(){
	
    initPuncher();
    
    $('#puncher-button').click(function(){
    	togglePuncherState();
	});
	
	$('#cookie-button').click(function(){
		toggleCookieState();
	});
	
	$(window).resize(function() {
    	initPuncher();
	});
});

function togglePuncherState() {
		if (!$('#puncher-button').hasClass('box-active')) {
			$('#puncher-button').addClass('box-active', 200);
			powerOn();
		} else {
			$('#puncher-button').removeClass('box-active', 200);
			powerOff();	
		}
}

function toggleCookieState() {
	if (!$('#cookie-button').hasClass('cookie-active')) {
		$('#cookie-button, #cookie-state, #indicators-button').addClass('cookie-active', 1000);
	} else {
		$('#cookie-button, #cookie-state, #indicators-button').removeClass('cookie-active', 1000);
	}
}

function initPuncher() {
	$('#puncher-container').css('position', 'relative');
	$('#puncher-container').css('top', $(window).height() / 2 - $('#puncher-container').height() / 2);
	$.cookie.json = true;
	$("#knob").knob({
		"fgColor":"#aaa",
        draw : tronDraw
    });
	$( "#progressbar" ).progressbar();
	$('#tabs').tabs();
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