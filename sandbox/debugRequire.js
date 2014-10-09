(function ( win ) {

	'use strict';

	// this is just a quick hack to enable easier debugging through
	// shorter stack traces - all the Module.emit and Module.check
	// garbage fired by require.js gets lopped off by the setTimeout

	var actualRequire, fakeRequire;

	actualRequire = win._require = win.require;

	fakeRequire = function ( deps, callback ) {
		return actualRequire( deps, delay( callback ) );
	};

	each( keys( actualRequire ), function ( key ) {
		fakeRequire[ key ] = actualRequire[ key ];
	});

	window.require = fakeRequire;

	function delay ( fn ) {
		return function () {
			var self = this, args = arguments;

			setTimeout( function start () {
				fn.apply( self, args );
			}, 0 );
		};
	}

	// IE... sigh
	function keys ( object ) {
		var keys, key;

		if ( typeof Object.keys === 'function' ) {
			return Object.keys( object );
		}

		keys = [];
		for ( key in object ) {
			if ( object.hasOwnProperty( key ) ) {
				keys.push( key );
			}
		}

		return keys;
	}

	function each ( arr, iterator ) {
		var i, len;

		if ( typeof arr.forEach === 'function' ) {
			return arr.forEach( iterator );
		}

		len = arr.length;
		for ( i = 0; i < len; i += 1 ) {
			if ( arr.hasOwnProperty( i ) ) {
				iterator( arr[i], i, arr );
			}
		}
	}

}( window ));
