$(document).ready(function(){
    
	initPuncher();
	$.cookie.json = true;
	
	$('#puncher-button').click(function(){
    	togglePuncherState();
		if ($('#puncher-button').hasClass('box-active')) {
			powerOn();
		} else {
			powerOff();	
		}
	});
	
	$('#cookie-button').click(function(){
		toggleCookieState();
	});
	$('#indicators-button').click(function(){
		toggleIndicatorsState();
	});
	$('#delete-cookie').click(function(){
		$( "#delete-warning" ).dialog({
			resizable: false,
			height:140,
			modal: false,
			buttons: {
				"Annuler": function() {
					$( this ).dialog( "close" );
				},
				"Vider": function() {
					viderCookie();
					$( this ).dialog( "close" );
				}
			}
		});
	});
});

function viderCookie() {
	$.removeCookie('punches');
	initCookieInfos();
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

function initPuncher() {
	centerPuncher();
	$(window).resize(function() {
    	centerPuncher();
	});
	
	var punches = $.cookie('punches');
	initCookieInfos(punches);
	initIndicators(punches);
}

function initIndicators(punches) {
	$('#temps-total');
}

function todayCheckInTime(punches) {
	
}

function initCookieInfos(punches) {
	// Progressbar init
	var progressbar = $( "#progressbar" ), progressLabel = $( ".progress-label" );
	  
	progressbar.progressbar({change: function() {
        progressLabel.text( progressbar.progressbar( "value" ) + "%" );
    }});
	
	// Gets the size ratio of the cookie informations
	if (punches != undefined) {
		punches = JSON.parse(punches);
		progressbar.progressbar( "option", "value", sizeRatio(punches) );
	}
	else {
		progressbar.progressbar( "option", "value", 0 );
	}
	
	// Button init
	$('#delete-cookie').button({ icons: { primary: "ui-icon-trash" }, text: false });
	$('#delete-cookies').button({ icons: { primary: "ui-icon-closethick" } , text: false});
}