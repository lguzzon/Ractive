import { capture } from '../global/capture';
import Model from './Model';
import { handleChange, marked } from '../shared/methodCallers';

export default class ComputationChild extends Model {
	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );

		const parentValue = this.parent.get();
		return parentValue ? parentValue[ this.key ] : undefined;
	}

	handleChange () {
		this.dirty = true;

		this.links.forEach( marked );
		this.deps.forEach( handleChange );
		this.children.forEach( handleChange );
		this.clearUnresolveds(); // TODO is this necessary?
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new ComputationChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	// TODO this causes problems with inter-component mappings
	// set () {
	// 	throw new Error( `Cannot set read-only property of computed value (${this.getKeypath()})` );
	// }
}
