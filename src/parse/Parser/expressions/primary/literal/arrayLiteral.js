import types from 'config/types';
import getExpressionList from 'parse/Parser/expressions/shared/expressionList';

export default function ( parser ) {
	var start, expressionList;

	start = parser.pos;

	// allow whitespace before '['
	parser.allowWhitespace();

	if ( !parser.matchString( '[' ) ) {
		parser.pos = start;
		return null;
	}

	expressionList = getExpressionList( parser );

	if ( !parser.matchString( ']' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: types.ARRAY_LITERAL,
		m: expressionList
	};
}
