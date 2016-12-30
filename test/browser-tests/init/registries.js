import { test } from 'qunit';
import registries from '../../Ractive/config/registries';
import { initModule } from '../test-config';

export default function() {
	initModule( 'init/registries.js' );

	test( 'has globally registered', t => {
		let foo = {};

		registries.forEach( r => {
			let target = r.useDefaults ? Ractive.defaults : Ractive;
			target[ r.name ].foo = foo;
		});

		// Special case - computation signature can't be an empty object
		Ractive.defaults.computed.foo = function () {};

		const ractive = new Ractive({});

		registries.forEach( r => {
			t.equal( ractive[ r.name ].foo, ( r.useDefaults ? Ractive.defaults : Ractive )[ r.name ].foo , r.name );
		});

		registries.forEach( r => {
			let target = r.useDefaults ? Ractive.defaults : Ractive;
			delete target[ r.name ] .foo;
		});
	});
}
