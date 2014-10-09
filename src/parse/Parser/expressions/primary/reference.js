import types from 'config/types';
import patterns from 'parse/Parser/expressions/shared/patterns';

var dotRefinementPattern, arrayMemberPattern, getArrayRefinement, globals, keywords;
dotRefinementPattern = /^\.[a-zA-Z_$0-9]+/;

getArrayRefinement = function ( parser ) {
	var num = parser.matchPattern( arrayMemberPattern );

	if ( num ) {
		return '.' + num;
	}

	return null;
};

arrayMemberPattern = /^\[(0|[1-9][0-9]*)\]/;

// if a reference is a browser global, we don't deference it later, so it needs special treatment
globals = /^(?:Array|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)$/;

// keywords are not valid references, with the exception of `this`
keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;

export default function ( parser ) {
	var startPos, ancestor, name, dot, combo, refinement, lastDotIndex;

	startPos = parser.pos;

	// we might have a root-level reference
	if ( parser.matchString( '~/' ) ) {
		ancestor = '~/';
	}

	else {
		// we might have ancestor refs...
		ancestor = '';
		while ( parser.matchString( '../' ) ) {
			ancestor += '../';
		}
	}

	if ( !ancestor ) {
		// we might have an implicit iterator or a restricted reference
		dot = parser.matchString( '.' ) || '';
	}

	name = parser.matchPattern( /^@(?:index|key)/ ) || parser.matchPattern( patterns.name ) || '';

	// bug out if it's a keyword
	if ( keywords.test( name ) ) {
		parser.pos = startPos;
		return null;
	}

	// if this is a browser global, stop here
	if ( !ancestor && !dot && globals.test( name ) ) {
		return {
			t: types.GLOBAL,
			v: name
		};
	}

	combo = ( ancestor || dot ) + name;

	if ( !combo ) {
		return null;
	}

	while ( refinement = parser.matchPattern( dotRefinementPattern ) || getArrayRefinement( parser ) ) {
		combo += refinement;
	}

	if ( parser.matchString( '(' ) ) {

		// if this is a method invocation (as opposed to a function) we need
		// to strip the method name from the reference combo, else the context
		// will be wrong
		lastDotIndex = combo.lastIndexOf( '.' );
		if ( lastDotIndex !== -1 ) {
			combo = combo.substr( 0, lastDotIndex );
			parser.pos = startPos + combo.length;
		} else {
			parser.pos -= 1;
		}
	}

	return {
		t: types.REFERENCE,
		n: combo.replace( /^this\./, './' ).replace( /^this$/, '.' )
	};
}
