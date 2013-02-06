$(document).ready(function(){
    
	initPuncher();
	$.cookie.json = true;
	
	$('#puncher-button').click(function(){
    	togglePuncherState();
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
	powerOff();
}

/**
 * Turns the puncher's power on
 */
function powerOn() {
	$('#puncher-button').addClass('box-active');
	// Changes the color of the progress bar
	$("#knob").trigger('configure', {"fgColor":"#26B3F7", "shadow" : true});
	
	// Regular update of the progress bar and indicators
	$(document).everyTime('1s', 'puncherTimer', function() {
		console.log('Is Timing...');
		updateIndicators();
	});
}

/**
 * Turns the puncher's power off
 */
function powerOff() {
	$('#puncher-button').removeClass('box-active');
	$('#puncher-button').removeClass('over-time');
	// Changes the color of the progress bar
	$("#knob").trigger('configure', {"fgColor":"#aaa", "shadow" : false});
	// Stops the update of the progress bar
	$(document).stopTime('puncherTimer');
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

/**
 * Inits the application's data and displays everything at it's right place
 */
function initPuncher() {
	// Displays the circular loading bar using jquery.knob
	$("#knob").knob({
		"fgColor":"#aaa",
        draw : tronDraw
    });
	
	// Centers the puncher on the page
	centerPuncher();
	$(window).resize(function() {
    	centerPuncher();
	});

	// Loads the initial data of the puncher
	$.cookie.json = true;
	var punches = $.cookie('punches');
	if (punches[punches.length -1]['check'] == 'I') {
		powerOn();
	}
	initCookieInfos(punches);
	updateIndicators(punches);
}

function initCookieInfos(punches) {
	// Progressbar init
	var progressbar = $( "#progressbar" ), progressLabel = $( ".progress-label" );
	  
	progressbar.progressbar({change: function() {
        progressLabel.text( progressbar.progressbar( "value" ) + "%" );
    }});
	
	// Gets the size ratio of the cookie informations
	if (punches != undefined) {
		progressbar.progressbar( "option", "value", sizeRatio(punches) );
	}
	else {
		progressbar.progressbar( "option", "value", 0 );
	}
	
	// Button init
	$('#delete-cookie').button({ icons: { primary: "ui-icon-trash" }, text: false });
	$('#delete-cookies').button({ icons: { primary: "ui-icon-closethick" } , text: false});
}

function updateIndicators(punches) {
	var punches = (typeof punches === "undefined") ? $.cookie('punches') : punches;
	
	var indicators = calculateIndicators(punches);
	
	$('#total-time').text(ms2string(indicators['totalTime']));
		
	// Si on a dépassé le temps alloué
	if (indicators['dayRatio'] > 100) {
		$('#puncher-button').addClass('over-time');
		indicators['dayRatio'] = indicators['dayRatio'] - 100;
		$("#knob").trigger('configure', {"fgColor":"#CC0000", "shadow" : true});
		$("#time-spent, #last-time-spent").css('color','#cc0000');
	}
	
	$("#knob").val(Math.round(indicators['dayRatio'])).trigger('change');
}