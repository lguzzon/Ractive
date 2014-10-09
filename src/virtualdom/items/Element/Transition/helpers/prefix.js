import isClient from 'config/isClient';
import vendors from 'config/vendors';
import createElement from 'utils/createElement';
import camelCase from 'utils/camelCase';

var prefix, prefixCache, testStyle;

if ( !isClient ) {
	prefix = null;
} else {
	prefixCache = {};
	testStyle = createElement( 'div' ).style;

	prefix = function ( prop ) {
		var i, vendor, capped;

		prop = camelCase( prop );

		if ( !prefixCache[ prop ] ) {
			if ( testStyle[ prop ] !== undefined ) {
				prefixCache[ prop ] = prop;
			}

			else {
				// test vendors...
				capped = prop.charAt( 0 ).toUpperCase() + prop.substring( 1 );

				i = vendors.length;
				while ( i-- ) {
					vendor = vendors[i];
					if ( testStyle[ vendor + capped ] !== undefined ) {
						prefixCache[ prop ] = vendor + capped;
						break;
					}
				}
			}
		}

		return prefixCache[ prop ];
	};
}

export default prefix;
