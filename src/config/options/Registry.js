import create from 'utils/create';
import 'legacy';

function Registry ( name, useDefaults ) {
	this.name = name;
	this.useDefaults = useDefaults;
}

Registry.prototype = {

	constructor: Registry,

 	extend: function ( Parent, proto, options ) {
		this.configure(
			this.useDefaults ? Parent.defaults : Parent,
			this.useDefaults ? proto : proto.constructor,
			options );
	},

	init: function ( Parent, ractive, options ) {
		this.configure(
			this.useDefaults ? Parent.defaults : Parent,
			ractive,
			options );
	},

	configure: function ( Parent, target, options ) {
		var name = this.name, option = options[ name ], registry;

		registry = create( Parent[name] );

		for ( let key in option ) {
			registry[ key ] = option[ key ];
		}

		target[ name ] = registry;
	},

	reset: function ( ractive ) {

		var registry = ractive[ this.name ];
		var changed = false;
		Object.keys( registry ).forEach( key => {
			var item = registry[key];
			if ( item._fn ) {
				if ( item._fn.isOwner ) {
					registry[key] = item._fn;
				} else {
					delete registry[key];
				}
				changed = true;
			}
		});
		return changed;
	},

	findOwner: function ( ractive, key ) {
		return ractive[ this.name ].hasOwnProperty( key )
			? ractive
			: this.findConstructor( ractive.constructor, key);
	},

	findConstructor: function ( constructor, key ) {
		if ( !constructor ) { return; }
		return constructor[ this.name ].hasOwnProperty( key )
			? constructor
			: this.findConstructor( constructor._parent, key );
	},

	find: function ( ractive, key ) {

		return recurseFind( ractive, r => r[ this.name ][ key ] );
	},

	findInstance: function ( ractive, key ) {

		return recurseFind( ractive, r => r[ this.name ][ key ] ? r : void 0 );
	}
};

function recurseFind ( ractive, fn ) {

	var find, parent;

	if ( find = fn( ractive ) ) {
		return find;
	}

	if ( !ractive.isolated && ( parent = ractive._parent ) ) {
		return recurseFind( parent, fn );
	}

}

export default Registry;
