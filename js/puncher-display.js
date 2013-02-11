function togglePuncherState() {
	if (!$('#puncher-button').hasClass('box-active')) {
		powerOn();
		// Save the state
		saveInCookie('I');
	} else {
		powerOff();	
		// Save the state
		saveInCookie('O');
	}
}

function toggleCookieState() {
	if (!$('#cookie-button').hasClass('cookie-active')) {
		$('#cookie-button, #cookie-state').addClass('cookie-active', 1000, "easeInOutCubic");
	} else {
		// FIXME Hack to prevent the glow of the indicators button to show on the cookie button when closing
		$('#cookie-button').removeClass('indicators-active');
		$('#cookie-button, #cookie-state').removeClass('cookie-active', 1000, "easeInOutCubic");
	}
}


function toggleIndicatorsState() {
	if (!$('#indicators-button').hasClass('indicators-active')) {
		$('#indicators, #indicators-button').addClass('indicators-active', 1000, "easeInOutCubic");
	} else {
		// FIXME Hack to prevent the glow of the indicators button to show on the cookie button when closing
		$('#cookie-button').addClass('indicators-active');
		$('#indicators, #indicators-button').removeClass('indicators-active', 1000, "easeInOutCubic");
	}
}

function centerPuncher() {

	// Centrage automatique
	var sections = ['cookie-section','indicators-section', 'puncher-section'];
	$('#content').css('position','absolute');
	$('#content').css('top', Math.floor($(window).height() / 2 - $('#content').height() / 2));
	for (var index in sections) {
		$('#' + sections[index]).css('position','absolute');
		$('#' + sections[index]).css('top', Math.floor($('#puncher-container').height() / 2 - $('#' + sections[index]).height() / 2));
	}
	
	$('#cookie-section').width($('#puncher-container').width() / 2);
	$('#indicators-section').width($('#puncher-container').width() / 2);
	$('#cookie-section').css('right', $('#puncher-container').width() / 2);
	$('#indicators-section').css('left', $('#puncher-container').width() / 2);
	
	$('#puncher-section').css('left', Math.floor($('#puncher-container').width() / 2 - $('#puncher-section').width() / 2));
}

function noTimeParametres() {
	$('#total-time-options div.ui-state-error').show();
	showTimeParametresIfNotDisplaying();
}

function showTimeParametresIfNotDisplaying() {
	if (!$('#total-time-options').dialog("isOpen")) {
		showTimeParametres();
	}
}

function showTimeParametres() {
	$('#total-time-options').dialog("open");
}
function showParametres() {
	$('#options').dialog("open");
}