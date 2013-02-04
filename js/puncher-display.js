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
		$('#cookie-button, #cookie-state').removeClass('cookie-active', 1000, "easeInOutCubic");
	}
}


function toggleIndicatorsState() {
	if (!$('#indicators-button').hasClass('indicators-active')) {
		$('#indicators, #indicators-button').addClass('indicators-active', 1000, "easeInOutCubic");
	} else {
		$('#indicators, #indicators-button').removeClass('indicators-active', 1000, "easeInOutCubic");
	}
}

function initPuncher() {
	centerPuncher();
	$(window).resize(function() {
    	centerPuncher();
	});
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
	$('#cookie-section').css('left', 0);
	$('#indicators-section').css('left', $(window).width() / 2);
	
	$('#cookie-button').css('margin-left',$('#cookie-section').width() - $('#cookie-button').width());
	
	$('#puncher-section').css('left', $(window).width() / 2 - $('#puncher-section').width() / 2);
	
	
}