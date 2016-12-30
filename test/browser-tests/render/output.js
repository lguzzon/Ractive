import { test } from 'qunit';
import legacy from '../../legacy';
import { svg } from '../../config/environment';
import tests from '../samples/render';
import { onWarn, initModule } from '../test-config';

export default function() {
	initModule( 'render/output.js' );

	function getData ( data ) {
		return typeof data === 'function' ? data() : deepClone( data );
	}

	tests.forEach( theTest => {
		if ( !svg && theTest.svg ) return;
		if ( theTest.nodeOnly ) return;

		[ false, true ].forEach( magic => {
			test( `${theTest.name} (magic: ${magic})`, t => { const data = getData( theTest.data );

				// suppress warnings about non-POJOs
				onWarn( msg => t.ok( /plain JavaScript object/.test( msg ) ) );

				const ractive = new Ractive({
					el: fixture,
					data,
					template: theTest.template,
					partials: theTest.partials,
					debug: true,
					magic
				});

				t.htmlEqual( fixture.innerHTML, theTest.result, 'innerHTML should match result' );
				t.htmlEqual( ractive.toHTML(), theTest.result, 'toHTML() should match result' );

				if ( theTest.new_data ) {
					const data = getData( theTest.new_data );

					ractive.set( data );

					t.htmlEqual( fixture.innerHTML, theTest.new_result, 'innerHTML should match result' );
					t.htmlEqual( ractive.toHTML(), theTest.new_result, 'toHTML() should match result' );
				} else if ( theTest.steps && theTest.steps.length ) {
					theTest.steps.forEach( step => {
						const data = getData( step.data );

						ractive.set( data );

						t.htmlEqual( fixture.innerHTML, step.result, step.message || 'innerHTML should match result' );
						t.htmlEqual( ractive.toHTML(), step.result, step.message || 'toHTML() should match result' );
					});
				}

				ractive.teardown();
			});
		});
	});

	function deepClone ( source ) {
		if ( !source || typeof source !== 'object' ) {
			return source;
		}

		if ( isArray( source ) ) {
			return source.map( deepClone );
		}

		let target = {};

		for ( let key in source ) {
			if ( source.hasOwnProperty( key ) ) {
				target[ key ] = deepClone( source[ key ] );
			}
		}

		return target;
	}

	function isArray ( thing ) {
		return Object.prototype.toString.call( thing ) === '[object Array]';
	}
}
