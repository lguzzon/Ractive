import unbindOption from 'virtualdom/items/Element/special/option/unbind';

export default function Element$unbind () {
	if ( this.fragment ) {
		this.fragment.unbind();
	}

	if ( this.binding ) {
		this.binding.unbind();
	}

	if ( this.eventHandlers ) {
		this.eventHandlers.forEach( unbind );
	}

	// Special case - <option>
	if ( this.name === 'option' ) {
		unbindOption( this );
	}

	this.attributes.forEach( unbind );
	this.conditionalAttributes.forEach( unbind );
}

function unbind ( x ) {
	x.unbind();
}
