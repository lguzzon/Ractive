/*global require, describe, it */
var Ractive = require( '../../ractive' );
var assert = require( 'assert' );

describe( 'Components', function () {
	it( 'should render in a non-DOM environment', function () {
		var Widget = Ractive.extend({
			template: '<p>foo-{{bar}}</p>'
		});

		var ractive = new Ractive({
			template: '<widget/>',
			data: {
				bar: 'baz'
			},
			components: {
				widget: Widget
			}
		});

		assert.equal( ractive.toHTML(), '<p>foo-baz</p>' );
	});

	it( 'should not fail if component has CSS', function () {
		var Widget = Ractive.extend({
			template: '<p>red</p>',
			css: 'p { color: red; }'
		});

		new Widget();
	});
});
