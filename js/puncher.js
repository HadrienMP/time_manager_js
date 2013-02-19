$(document).ready(function(){
    
	initPuncher();
	$.cookie.json = true;
	
	/*
	 * Starts or stops the puncher
	 */
	$('#puncher-button').click(function(){
    	togglePuncherState();
	});
	/*
	 * Opens or closes the cookie information pane
	 */
	$('#cookie-button').click(function(){
		toggleCookieState();
	});
	/*
	 * Opens or closes the indicators information pane
	 */
	$('#indicators-button').click(function(){
		toggleIndicatorsState();
	});
	/*
	 * Deals with the deletion of the cookie by providing a confirmation box
	 */
	$('#delete-cookie').click(function(){
		$( "#delete-warning" ).dialog({
			resizable: false,
            movable: true,
			height:140,
			modal: false,
			buttons: {
				"Vider": function() {
					eraseCookie();
					$( this ).dialog( "close" );
				},
				"Annuler": function() {
					$( this ).dialog( "close" );
				}
			}
		});
	});
	$('#time-options-button').click(showTimeParametres);
	$('#options-button').click(showParametres);
	$('#punches-options-button').click(showPunchesParametres);
    
    // Regular update of the progress bar and indicators
    $(document).everyTime('1s', 'puncherTimer', function() {
        updateIndicators();
    });
});

/**
 * Deletes the user's cookie and resets all of his data
 */
function eraseCookie() {
    $.removeCookie('punches');
    initCookieInfos();
    powerOff();
    updateIndicators();
    // Forces a reset of the estimated end time by setting the date to '' which will force the calculation of the date
    $('#time-end').text('');
}

/**
 * Turns the puncher's power on
 */
function powerOn() {
    $('#puncher-button').addClass('box-active');
    $('#puncher-container').addClass('on');
    // Changes the color of the progress bar
    var progressbarColor = "#26B3F7";
    if ($('#puncher-container').hasClass('over-time')) {
        var progressbarColor = "#CC0000";
    }
    $("#knob").trigger('configure', {"fgColor":progressbarColor, "shadow" : true});
}

function isPowerOn() {
    return $('#puncher-button').hasClass('box-active');
}

/**
 * Turns the puncher's power off
 */
function powerOff() {
    $('#puncher-container').removeClass('on');
    $('#puncher-button').removeClass('box-active');
    // Changes the color of the progress bar
    $("#knob").trigger('configure', {"fgColor":"#aaa", "shadow" : false});
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
    var parametres = $.cookie('parametres');
    var punches = $.cookie('punches');
    if (punches !== undefined && punches[punches.length -1]['check'] === 'I') {
        powerOn();
    }

    // Loads all the other initial datas
    initOptions(parametres);
    initCookieInfos(punches);
    updateIndicators(punches, parametres);
	initToolTip();
    setPunchesRange(punches);
}

function initToolTip() {
	$('#options-buttons-container').tooltip();
	$('#puncher-button').tooltip({
		position: { my: "left top+15", at: "left+3 bottom" }
    });
	$('#cookie-button').tooltip({
		position: { my: "right center", at: "left-15 center" }
	});
	$('#indicators-button').tooltip({
		position: { my: "left+15 center", at: "right center" }
	});
}

/**
 * Inits the cookie information such as size rate
 * @param {Object} punches the punches from the cookie
 */
function initCookieInfos(punches) {
    // Progressbar init
    var progressbar = $( "#progressbar" ), progressLabel = $( ".progress-label" );

    progressbar.progressbar({change: function() {
        progressLabel.text( progressbar.progressbar( "value" ) + "%" );
    }});

    // Gets the size ratio of the cookie informations
    if (punches !== undefined) {
        progressbar.progressbar( "option", "value", sizeRatio(punches) );
    }
    else {
        progressbar.progressbar( "option", "value", 0 );
    }

    // Button init
    $('#delete-cookie').button({ icons: { primary: "ui-icon-trash" }, text: false });
    $('#delete-cookies').button({ icons: { primary: "ui-icon-closethick" } , text: false});
}

/**
 * Updates the indicator values on the screen
 * @param {Object} punches optionnal parameter
 */
function updateIndicators(punches, parametres) {

    // This boolean is to determine wether or not we should calculate
    // all the indicators (they don't have any value yet)
    var firstCalculation = $('#time-end').text() === '';

    if (isPowerOn() || firstCalculation) {
        var punches = (typeof punches === "undefined") ? $.cookie('punches') : punches;
        var parametres = (typeof parametres === "undefined") ? $.cookie('parametres') : parametres;
        
        var indicators = calculateIndicators(new Date(), punches, parametres, firstCalculation);
        var timeDifference = ms2string(indicators['timeDifference']);
        // Si on a dépassé le temps alloué
        if (indicators['isOverTime']) {
            if (!$('#puncher-container').hasClass('over-time')) {
                // Modification des styles pour passer en rouge
                $('#puncher-container').addClass('over-time');
                if ($('#puncher-container').hasClass('on')) {
                    $("#knob").trigger('configure', {"fgColor":"#CC0000", "shadow" : true});
                }
            }
            // Rectification des indicateurs
            timeDifference = "+ " + timeDifference;
        }
        else if ($('#puncher-container').hasClass('over-time')) {
            $('#puncher-container').removeClass('over-time');
            if ($('#puncher-container').hasClass('on')) {
                powerOn();
            }
        }
        
        $('#total-time').text(ms2string(indicators['totalTime']));
        $('#time-difference').text(timeDifference);
        
        // The estimated end time is only calculated on the first calculation
        if (firstCalculation && indicators['timeEnd'] !== -1) {
            $('#time-end').text(myDateFormat(indicators['timeEnd']));
        }
        
        $("#knob").val(Math.round(indicators['dayRatio'] * 100) / 100).trigger('change');
        $('#puncher-button').attr('title', (Math.round(indicators['dayRatio'] * 100) / 100) + '%');
    }
    else if (!isPowerOn() && !$('#puncher-container').hasClass('over-time')) {
        // If the puncher is disabled, the end time rises each second
        var endTime = estimateEndTime();
        $('#time-end').text(myDateFormat(endTime));
    }
}


/**
 * Inits the options container etc.
 * @param parametres the associative array representing the parametres, 
 * used to init the parametres options
 */
function initOptions(parametres) {

	$('#options-buttons-container #time-options-button').button({ icons: { primary: "ui-icon-clock" }, text: false });
	$('#options-buttons-container #options-button').button({ icons: { primary: "ui-icon-gear" }, text: false });
	$('#options-buttons-container #punches-options-button').button({ icons: { primary: "ui-icon-wrench" }, text: false });
	
	$('#tooltips-options').buttonset();
	$('#button-tooltip-options').buttonset();
    
	if (parametres != undefined) {
		$('#days').val(parametres['days']);
		$('#hours').val(parametres['hours']);
		$('#minutes').val(parametres['minutes']);
		$('#seconds').val(parametres['seconds']);
	}
	
	$('#total-time-options').dialog({
		draggable: false,
		autoOpen: false,
		show: {
			effect: 'fade',
			duration: 300
		},
		hide: {
			effect: 'fade',
			duration: 300
		},
		close: saveParametres,
	});
	
	$('#options').dialog({
		draggable: false,
		autoOpen: false,
		show: {
			effect: 'fade',
			duration: 300
		},
		hide: {
			effect: 'fade',
			duration: 300
		}
	});
    
    $('#punches-options').dialog({
		draggable: false,
		autoOpen: false,
		show: {
			effect: 'fade',
			duration: 300
		},
		hide: {
			effect: 'fade',
			duration: 300
		}
	});
}

// TODO change me to use a working slider or another interface
function setPunchesRange(punches) {
    
    var punchesDates = [];
    if (punches !== undefined) {
        var todaysPunches = getTodaysPunches(punches);
        for (var index in todaysPunches) {
            punchesDates.push(todaysPunches[index]['date']);
        }
    }
    
    var dayStart = new Date().setHours(0,0,0,0);
    var dayEnd = new Date().setHours(23,59,59,999);
    
    $( "#punches-range" ).slider({
        range: true,
        min: dayStart,
        max: dayEnd,
        values: punchesDates,
        slide: function( event, ui ) {
            printPunchesValues(ui.values);
        }
    });
	printPunchesValues($( "#punches-range" ).slider( "values"));

}