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
}

/**
 * Turns the puncher's power on
 */
function powerOn() {
    $('#puncher-button').addClass('box-active');
    // Changes the color of the progress bar
    $("#knob").trigger('configure', {"fgColor":"#26B3F7", "shadow" : true});
}

function isPowerOn() {
    return $('#puncher-button').hasClass('box-active');
}

/**
 * Turns the puncher's power off
 */
function powerOff() {
    $('#puncher-button').removeClass('box-active');
    $('#puncher-button').removeClass('over-time');
    // Changes the color of the progress bar
    $("#knob").trigger('configure', {"fgColor":"#aaa", "shadow" : false});
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
    if (punches === undefined) {
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

    if (isPowerOn() || $('#total-time').text() === '') {
        var punches = (typeof punches === "undefined") ? $.cookie('punches') : punches;
        var parametres = (typeof parametres === "undefined") ? $.cookie('parametres') : parametres;
        
        var indicators = calculateIndicators(punches, parametres);
        var timeDifference = ms2string(indicators['timeDifference']);
        // Si on a dépassé le temps alloué
        if (indicators['isOverTime']) {
            if (!$('#puncher-container').hasClass('over-time')) {
                // Modification des styles pour passer en rouge
                $('#puncher-container').addClass('over-time');
                $("#knob").trigger('configure', {"fgColor":"#CC0000", "shadow" : true});
            }
            // Rectification des indicateurs
            timeDifference = "+ " + timeDifference;
        }
        else if ($('#puncher-container').hasClass('over-time')) {
            $('#puncher-container').removeClass('over-time');
            powerOn();
        }
        
        // For each indicator we store its raw value in order to be able 
        // to get it fast and calculate new indicators without having to 
        // parses the punches everytime
        
        $('#total-time').text(ms2string(indicators['totalTime']));
        $('#ms-total-time').text(indicators['totalTime']);
        
        $('#time-difference').text(timeDifference);
        $('#ms-time-difference').text(indicators['timeDifference']);
        
        $('#time-end').text(myDateFormat(indicators['timeEnd']));
        $('#ms-time-end').text(indicators['timeEnd']);
        
        $("#knob").val(Math.round(indicators['dayRatio'] * 100) / 100).trigger('change');
        $('#puncher-button').attr('title', (Math.round(indicators['dayRatio'] * 100) / 100) + '%');
    }
    else {
        // If the puncher is disabled, the end time rises each second
        var endTime = estimateEndTime(parseInt($('#ms-time-difference').text()));
        $('#time-end').text(myDateFormat(endTime));
        $('#ms-time-end').text(endTime);
    }
}


/**
 * Inits the options container etc.
 */
function initOptions(parametres) {

	$('#options-buttons-container #time-options-button').button({ icons: { primary: "ui-icon-clock" }, text: false });
	$('#options-buttons-container #options-button').button({ icons: { primary: "ui-icon-gear" }, text: false });
	$('#options-buttons-container #cookie-info-button').button({ icons: { primary: "ui-icon-gear" }, text: false });
	
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
}

function saveParametres() {
    var parametres = {
        'days' : $('#total-time-options #days').val(),
        'hours' : $('#total-time-options #hours').val(),
        'minutes' : $('#total-time-options #minutes').val(),
        'seconds' : $('#total-time-options #seconds').val()
    };
    $.cookie('parametres',parametres, {expires: 7});
}