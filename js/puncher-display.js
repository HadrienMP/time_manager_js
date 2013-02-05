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
	for (var index in sections) {
		$('#' + sections[index]).css('position','absolute');
		$('#' + sections[index]).css('top', $(window).height() / 2 - $('#' + sections[index]).height() / 2);
	}
	
	$('#cookie-section').width($(window).width() / 2);
	$('#indicators-section').width($(window).width() / 2);
	$('#cookie-section').css('right', $(window).width() / 2);
	$('#indicators-section').css('left', $(window).width() / 2);
	
	$('#puncher-section').css('left', $(window).width() / 2 - $('#puncher-section').width() / 2);
	
	
}