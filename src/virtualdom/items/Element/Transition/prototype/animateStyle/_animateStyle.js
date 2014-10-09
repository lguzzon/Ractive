import legacy from 'legacy';
import isClient from 'config/isClient';
import warn from 'utils/warn';
import Promise from 'utils/Promise';
import prefix from 'virtualdom/items/Element/Transition/helpers/prefix';
import createTransitions from 'virtualdom/items/Element/Transition/prototype/animateStyle/createTransitions';
import visibility from 'virtualdom/items/Element/Transition/prototype/animateStyle/visibility';

var animateStyle, getComputedStyle, resolved;

if ( !isClient ) {
	animateStyle = null;
} else {
	getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;

	animateStyle = function ( style, value, options, complete ) {

		var t = this, to;

		// Special case - page isn't visible. Don't animate anything, because
		// that way you'll never get CSS transitionend events
		if ( visibility.hidden ) {
			this.setStyle( style, value );
			return resolved || ( resolved = Promise.resolve() );
		}

		if ( typeof style === 'string' ) {
			to = {};
			to[ style ] = value;
		} else {
			to = style;

			// shuffle arguments
			complete = options;
			options = value;
		}

		// As of 0.3.9, transition authors should supply an `option` object with
		// `duration` and `easing` properties (and optional `delay`), plus a
		// callback function that gets called after the animation completes

		// TODO remove this check in a future version
		if ( !options ) {
			warn( 'The "' + t.name + '" transition does not supply an options object to `t.animateStyle()`. This will break in a future version of Ractive. For more info see https://github.com/RactiveJS/Ractive/issues/340' );

			options = t;
			complete = t.complete;
		}

		var promise = new Promise( function ( resolve ) {
			var propertyNames, changedProperties, computedStyle, current, from, i, prop;

			// Edge case - if duration is zero, set style synchronously and complete
			if ( !options.duration ) {
				t.setStyle( to );
				resolve();
				return;
			}

			// Get a list of the properties we're animating
			propertyNames = Object.keys( to );
			changedProperties = [];

			// Store the current styles
			computedStyle = getComputedStyle( t.node );

			from = {};
			i = propertyNames.length;
			while ( i-- ) {
				prop = propertyNames[i];
				current = computedStyle[ prefix( prop ) ];

				if ( current === '0px' ) {
					current = 0;
				}

				// we need to know if we're actually changing anything
				if ( current != to[ prop ] ) { // use != instead of !==, so we can compare strings with numbers
					changedProperties.push( prop );

					// make the computed style explicit, so we can animate where
					// e.g. height='auto'
					t.node.style[ prefix( prop ) ] = current;
				}
			}

			// If we're not actually changing anything, the transitionend event
			// will never fire! So we complete early
			if ( !changedProperties.length ) {
				resolve();
				return;
			}

			createTransitions( t, to, options, changedProperties, resolve );
		});

		// If a callback was supplied, do the honours
		// TODO remove this check in future
		if ( complete ) {
			warn( 't.animateStyle returns a Promise as of 0.4.0. Transition authors should do t.animateStyle(...).then(callback)' );
			promise.then( complete );
		}

		return promise;
	};
}

export default animateStyle;
