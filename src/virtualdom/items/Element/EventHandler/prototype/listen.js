import config from 'config/config';
import genericHandler from 'virtualdom/items/Element/EventHandler/shared/genericHandler';
import log from 'utils/log';

var customHandlers = {},
	touchEvents = {
		touchstart: true,
		touchmove: true,
		touchend: true,
		touchcancel: true,
		//not w3c, but supported in some browsers
		touchleave: true
	};

export default function EventHandler$listen () {

	var definition, name = this.name;

	if ( this.invalid ) { return; }

	if ( definition = config.registries.events.find( this.root, name ) ) {
		this.custom = definition( this.node, getCustomHandler( name ) );
	} else {
		// Looks like we're dealing with a standard DOM event... but let's check
		if ( !( 'on' + name in this.node ) && !( window && 'on' + name in window ) ) {

			// okay to use touch events if this browser doesn't support them
			if ( !touchEvents[ name ] ) {
				log.error({
					debug: this.root.debug,
					message: 'missingPlugin',
					args: {
						plugin: 'event',
						name: name
					}
				});
			}

			return;
		}

		this.node.addEventListener( name, genericHandler, false );
	}

	this.hasListener = true;

}

function getCustomHandler ( name ) {
	if ( !customHandlers[ name ] ) {
		customHandlers[ name ] = function ( event ) {
			var storage = event.node._ractive;

			event.index = storage.index;
			event.keypath = storage.keypath;
			event.context = storage.root.get( storage.keypath );

			storage.events[ name ].fire( event );
		};
	}

	return customHandlers[ name ];
}
