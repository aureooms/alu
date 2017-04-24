import { Integer } from './' ;
import { parse } from '@aureooms/js-integer-big-endian' ;

export class IntegerRing {

	constructor ( name , base ) {
		this.name = name ;
		this.base = base ;
	}

	from ( object , base = undefined , is_negative = 0 ) {

		switch ( typeof object ) {
			case 'number' :
				if ( base !== undefined ) throw 'IntegerRing#from: using the base parameter does not make sense when parsing a JavaScript number.' ;
				return this.from_string( '' + object , 10 , is_negative ) ;
			case 'string' :
				if ( base === undefined ) base = 10 ;
				return this.from_string( object , base , is_negative ) ;
			default:
				throw `IntegerRing#from cannot handle ${typeof object}` ;
		}

	}

	from_string ( string , base = 10 , is_negative = 0  ) {

		if ( string.length === 0 ) throw 'IntegerRing#from_string cannot parse empty string.' ;

		if ( string[0] === '-' ) return this.from_string( string.slice(1) , base , ~is_negative ) ;

		if ( string[0] === '+' ) return this.from_string( string.slice(1) , base , is_negative ) ;

		const limbs = parse( base , this.base , string ) ;

		return new Integer( this.base , is_negative , limbs ) ;

	}

	toString ( ) {
		return this.name ;
	}

	static add ( first , second ) {
		return first.add(second) ;
	}

	static sub ( first , second ) {
		return first.sub(second) ;
	}

	static mul ( first , second ) {
		return first.mul(second) ;
	}

	static pow ( first , second ) {
		return first.pow(second) ;
	}

	static div ( first , second ) {
		return first.div(second) ;
	}

	static mod ( first , second ) {
		return first.mod(second) ;
	}

}