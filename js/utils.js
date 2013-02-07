function diffDate(date1, date2) {
	return ms2string(date1 - date2);
}

function ms2string(ms) {

	var s = ms/1000;
	var m = s/60;
	var h = m/60;
	var d = h/24;
	
	mF = Math.floor(m);
	hF = Math.floor(h);
	dF = Math.floor(d);
	
	s = (m - mF)*60;
	m = (h - hF)*60;
	h = (d - dF)*24;
	
	s = Math.floor(s);
	m = Math.floor(m);
	h = Math.floor(h);
	d = Math.floor(d);
	
	var diff = '';
	if (d > 0)
		diff += d + ' days ';
	if (h > 0)
		diff += h + ' h ';
	if (m > 0)
		diff += m + ' min ';
		
	diff += s + ' s';
	
	return  diff;
}

function roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if (typeof value === 'object' && objectList.indexOf( value ) === -1) {
            objectList.push( value );
            for (var i in value) {
                try {
                    if (i == 'Blob') bytes += value[i].size || 0;
                    stack.push(value[i]);
                    stack.push(i);
                } catch(e) {};
            };
        }
    }
    return bytes;
}

function sizeRatio(object) {
	return (Math.round(roughSizeOfObject(object) * 100 * 100 / 2188) / 100);
}