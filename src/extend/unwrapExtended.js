import wrap from 'utils/wrapMethod';
import config from 'config/config';
import circular from 'circular';

var Ractive;

circular.push( function () {
	Ractive = circular.Ractive;
});

export default function unwrapExtended ( Child ) {
	if ( !( Child.prototype instanceof Ractive ) ) { return Child; }

	let options = {};

	while ( Child ) {
		config.registries.forEach( r => {
			addRegistry(
				r.useDefaults ? Child.prototype : Child,
				options, r.name );
		});

		Object.keys( Child.prototype ).forEach( key => {
			if ( key === 'computed' ) { return; }

			var value = Child.prototype[ key ];

			if ( !( key in options ) ) {
				options[ key ] = value._method ? value._method : value;
			}

			// is it a wrapped function?
			else if ( typeof options[ key ] === 'function'
					&& typeof value === 'function'
					&& options[ key ]._method ) {

				let result, needsSuper = value._method;

				if( needsSuper ) { value = value._method; }

				// rewrap bound directly to parent fn
				result = wrap( options[ key ]._method, value );


				if( needsSuper ) { result._method = result; }

				options[ key ] = result;
			}
		});

		if( Child._parent !== Ractive ) {
			Child = Child._parent;
		} else {
			Child = false;
		}
	}

	return options;
}

function addRegistry ( target, options, name ) {
	var registry, keys = Object.keys( target[ name ] );

	if ( !keys.length ) { return; }

	if ( !( registry = options[ name ] ) ) {
		registry = options[ name ] = {};
	}

	keys
		.filter( key => !( key in registry ) )
		.forEach( key => registry[ key ] = target[ name ][ key ] );
}
