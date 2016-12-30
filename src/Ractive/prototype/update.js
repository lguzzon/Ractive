import Hook from '../../events/Hook';
import runloop from '../../global/runloop';
import { splitKeypath } from '../../shared/keypaths';

const updateHook = new Hook( 'update' );

export function update ( ractive, model ) {
	// if the parent is wrapped, the adaptor will need to be updated before
	// updating on this keypath
	if ( model.parent && model.parent.wrapper ) {
		model.parent.adapt();
	}

	const promise = runloop.start( ractive, true );

	model.mark();
	model.registerChange( model.getKeypath(), model.get() );

	if ( !model.isRoot ) {
		// there may be unresolved refs that are now resolvable up the context tree
		let parent = model.parent, key = model.key;
		while ( parent && !parent.isRoot ) {
			if ( parent.clearUnresolveds ) parent.clearUnresolveds( key );
			key = parent.key;
			parent = parent.parent;
		}
	}

	// notify upstream of changes
	model.notifyUpstream();

	runloop.end();

	updateHook.fire( ractive, model );

	return promise;
}

export default function Ractive$update ( keypath ) {
	if ( keypath ) keypath = splitKeypath( keypath );

	return update( this, keypath ? this.viewmodel.joinAll( keypath ) : this.viewmodel );
}
