function diffDate(date1, date2) {
    return ms2string(date1 - date2);
}

function ms2string(ms) {

	var diff = '';
	if (ms < 0) {
		ms = -ms;
		diff += '- ';
	}

    // Set the unit values in milliseconds.
    var msecPerMinute = 1000 * 60;
    var msecPerHour = msecPerMinute * 60;
    var msecPerDay = msecPerHour * 24;
    
    // Calculate how many days the interval contains. Subtract that
    // many days from the interval to determine the remainder.
    var days = Math.floor(ms / msecPerDay );
    ms = ms - (days * msecPerDay );

    // Calculate the hours, minutes, and seconds.
    var hours = Math.floor(ms / msecPerHour );
    ms = ms - (hours * msecPerHour );

    var minutes = Math.floor(ms / msecPerMinute );
    ms = ms - (minutes * msecPerMinute );

    var seconds = Math.round(ms / 1000 );

    if (days > 0) {
        diff += days + ' days ';
    }
    if (hours > 0) {
        diff += hours + ' h ';
    }
    if (minutes > 0) {
        diff += minutes + ' min ';
    }

    diff += seconds + ' s';

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
                    if (i === 'Blob') {
                        bytes += value[i].size || 0;
                    }
                    stack.push(value[i]);
                    stack.push(i);
                } catch(e) {
                    console.log('roughSizeOfObject erreur de calcul');
                };
            };
        }
    }
    return bytes;
}

function sizeRatio(object) {
    return (Math.round(roughSizeOfObject(object) * 100 * 100 / 2188) / 100);
}

function myDateFormat(time) {
    var date = new Date(time);
    // The slice -2 insures us that we'll get only 2 decimals, so 13 or 02 not 013.
    return ('0' + date.getDate()).slice(-2) + '/' 
            + ('0' + (date.getMonth() + 1)).slice(-2) + ' ' 
            + ('0' + date.getHours()).slice(-2) + ':' 
            + ('0' + date.getMinutes()).slice(-2) + ':'
            + ('0' + date.getSeconds()).slice(-2);
}

function hmsDateFormat(time) {
    var date = new Date(time);
    // The slice -2 insures us that we'll get only 2 decimals, so 13 or 02 not 013.
    return ('0' + date.getHours()).slice(-2) + ':' 
            + ('0' + date.getMinutes()).slice(-2) + ':'
            + ('0' + date.getSeconds()).slice(-2);
}

/**
 * New Parsing function for XDate
 * @param str the date must be in the following format dd/mm/yyyy
 * @return XDate generated xdate
 */
function parseDMY(str) {
	// this example parses dates like "date/month/year"
	var parts = str.split('/');
	if (parts.length === 3) {
		return new XDate(
			parseInt(parts[2]), // year
            parseInt(parts[1] ? parts[1]-1 : 0), // month
			parseInt(parts[0]) // date
		);
	}
}
 
XDate.parsers.push(parseDMY);