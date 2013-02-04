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
		$('#cookie-button, #cookie-state, #indicators-button').addClass('cookie-active', 1000, "easeInOutCubic");
	} else {
		$('#cookie-button, #cookie-state, #indicators-button').removeClass('cookie-active', 1000, "easeInOutCubic");
	}
}


function toggleIndicatorsState() {
	if (!$('#indicators-button').hasClass('indicators-active')) {
		$('#cookie-button, #indicators, #indicators-button').addClass('indicators-active', 1000, "easeInOutCubic");
	} else {
		$('#cookie-button, #indicators, #indicators-button').removeClass('indicators-active', 1000, "easeInOutCubic");
	}
}

function initPuncher() {
	// Centrage vertical automatique
	$('#puncher-container').css('position', 'relative');
	$('#puncher-container').css('top', $(window).height() / 2 - $('#indicators-container').height() / 2);
	$.cookie.json = true;
	$("#knob").knob({
		"fgColor":"#aaa",
        draw : tronDraw
    });
	$( "#progressbar" ).progressbar();
}