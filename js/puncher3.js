$(document).ready(function(){
    
	initPuncher();
	
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
});