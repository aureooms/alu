import {DEFAULT_DISPLAY_BASE} from './DEFAULT_DISPLAY_BASE.js';
import {ZeroDivisionError} from './ZeroDivisionError.js';

import {ValueError} from '@aureooms/js-error';

import {_from_number} from './_from_number.js';

import {
	stringify,
	convert,
	_trim_positive,
	_alloc,
	_copy,
	_zeros,
	jz,
	cmp,
	eq,
	add,
	_sub,
	mul,
	_idivmod,
	_pow_double,
	increment,
	euclidean_algorithm,
	extended_euclidean_algorithm,
} from '@aureooms/js-integer-big-endian';

import {MIN_NUMBER, MAX_NUMBER, MAX_BASE} from './_limits.js';

export class Integer {
	constructor(base, is_negative, limbs) {
		this._base = base;
		this._is_negative = is_negative;
		this._limbs = limbs;
	}

	move(other) {
		other._base = this._base;
		other._is_negative = this._is_negative;
		other._limbs = this._limbs;
		return other;
	}

	clone() {
		return new Integer(this._base, this._is_negative, this._limbs);
	}

	_limbs_in_base(base) {
		// TODO save result for later ? Maybe replace base ?
		return this._base === base
			? this._limbs
			: convert(this._base, base, this._limbs, 0, this._limbs.length);
	}

	toString(base = DEFAULT_DISPLAY_BASE) {
		if (this.iszero()) return '0';

		const digits = stringify(
			this._base,
			base,
			this._limbs,
			0,
			this._limbs.length,
		);

		return this._is_negative ? '-' + digits : digits;
	}

	add(other) {
		if (this._is_negative !== other._is_negative) {
			return other._is_negative
				? this.sub(other.opposite())
				: other.sub(this.opposite());
		}

		const result_is_negative = this._is_negative;
		const r = this._base;

		const a = this._limbs;

		const b = other._limbs_in_base(r);

		const c = _zeros(Math.max(a.length, b.length) + 1);

		add(r, a, 0, a.length, b, 0, b.length, c, 0, c.length);

		return new Integer(r, result_is_negative, c);
	}

	iadd(other) {
		// TODO optimize but be careful with side effects
		return this.add(other).move(this);
	}

	addn(number) {
		// TODO optimize
		return this.add(_from_number(number));
	}

	iaddn(number) {
		// TODO optimize but be careful with side effects
		return this.addn(number).move(this);
	}

	sub(other) {
		if (this._is_negative !== other._is_negative) {
			return other._is_negative
				? this.add(other.opposite())
				: this.opposite().add(other).opposite();
		}
		// /!\ _sub needs |c| >= |a| >= |b|

		const r = this._base;
		const a = this._limbs;
		const aj = a.length;
		const ai = _trim_positive(a, 0, aj);

		if (ai >= aj) return other.opposite();

		const b = other._limbs_in_base(r);
		const bj = b.length;
		const bi = _trim_positive(b, 0, bj);

		if (bi >= bj) return this.clone();

		if (cmp(a, ai, aj, b, bi, bj) < 0) {
			const c = _zeros(bj - bi);

			_sub(r, b, bi, bj, a, ai, aj, c, 0, c.length);

			return new Integer(r, ~this._is_negative, c);
		}

		const c = _zeros(aj - ai);

		_sub(r, a, ai, aj, b, bi, bj, c, 0, c.length);

		return new Integer(r, this._is_negative, c);
	}

	isub(other) {
		// TODO optimize but be careful with side effects
		return this.sub(other).move(this);
	}

	subn(number) {
		return this.sub(_from_number(number));
	}

	isubn(number) {
		return this.subn(number).move(this);
	}

	mul(other) {
		const result_is_negative = this._is_negative ^ other._is_negative;
		const r = this._base;

		const a = this._limbs;

		const b = other._limbs_in_base(r);

		const c = _zeros(a.length + b.length);

		mul(r, a, 0, a.length, b, 0, b.length, c, 0, c.length);

		return new Integer(r, result_is_negative, c);
	}

	imul(other) {
		// TODO optimize but be careful with side effects
		return this.mul(other).move(this);
	}

	muln(number) {
		return this.mul(_from_number(number));
	}

	imuln(number) {
		return this.muln(number).move(this);
	}

	/**
	 * Computes <code>this</code> raised to the <code>x</code>th power.
	 * <code>x</code> is a double smaller or equal to 2^53.
	 *
	 * @param {Number} x The power to raise <code>this</code> to.
	 * @return {Integer} <code>this ^ x</code>
	 */
	pown(x) {
		const is_negative = this._is_negative & x & 1 ? -1 : 0;

		const a = this._limbs;
		const c = _zeros(Math.max(1, a.length * x));

		_pow_double(this._base, x, a, 0, a.length, c, 0, c.length);

		return new Integer(this._base, is_negative, c);
	}

	pow(other) {
		return this.pown(other.valueOf());
	}

	ipow(other) {
		// TODO optimize but be careful with side effects
		return this.pow(other).move(this);
	}

	ipown(number) {
		// TODO optimize but be careful with side effects
		return this.pown(number).move(this);
	}

	square() {
		// TODO optimize but be careful with side effects
		// TODO use this.mul(this) instead?
		return this.pown(2);
	}

	isquare() {
		// TODO optimize but be careful with side effects
		// TODO use this.imul(this) instead?
		return this.square().move(this);
	}

	div(other) {
		return this.divmod(other)[0];
	}

	divn(number) {
		return this.div(_from_number(number));
	}

	idiv(other) {
		// TODO optimize but be careful with side effects
		return this.div(other).move(this);
	}

	idivn(number) {
		return this.divn(number).move(this);
	}

	mod(other) {
		return this.divmod(other)[1];
	}

	modn(number) {
		return this.mod(_from_number(number));
	}

	imod(other) {
		// TODO optimize but be careful with side effects
		return this.mod(other).move(this);
	}

	imodn(number) {
		return this.modn(number).move(this);
	}

	divround(other) {
		const [q, r] = this.divmod(other);
		if (r.ge(other.divn(2).addn(other.iseven() ? 0 : 1)))
			increment(q._base, q._limbs, 0, q._limbs.length);
		return q;
	}

	divmod(other) {
		if (other.iszero()) throw new ZeroDivisionError('Integer division by zero'); // Optimize

		const quotient_is_negative = this._is_negative ^ other._is_negative;
		const r = this._base;

		// The underlying algorithm does not allow leading 0's so we trim them.
		const lj = this._limbs.length;
		const li = _trim_positive(this._limbs, 0, lj);

		// Dividend is 0
		if (li >= lj)
			return [new Integer(this._base, 0, [0]), new Integer(this._base, 0, [0])];

		// Dividend (& Remainder)
		const D = _alloc(lj - li);
		_copy(this._limbs, li, lj, D, 0);

		// Divisor
		const d = other._limbs_in_base(r);
		const dj = d.length;
		const di = _trim_positive(d, 0, dj); // Di < dj because d != 0

		// Quotient
		const q = _zeros(D.length);

		_idivmod(r, D, 0, D.length, d, di, dj, q, 0, q.length);

		const Q = new Integer(r, quotient_is_negative, q); // Quotient
		const R = new Integer(r, 0, D); // Remainder

		if ((this._is_negative || other._is_negative) && !jz(D, 0, D.length)) {
			if (other._is_negative) {
				if (this._is_negative) {
					R.negate(); // TODO optimize
				} else {
					increment(r, q, 0, q.length);
					R.iadd(other); // TODO optimize
				}
			} else {
				increment(r, q, 0, q.length);
				R.negate().iadd(other); // TODO optimize
			}
		}

		return [Q, R];
	}

	idivmod(other) {
		// TODO optimize but be careful with side effects
		const [q, r] = this.divmod(other);
		return [q, r.move(this)];
	}

	divmodn(number) {
		return this.divmod(_from_number(number));
	}

	idivmodn(number) {
		const [q, r] = this.divmodn(number);
		return [q, r.move(this)];
	}

	opposite() {
		return new Integer(this._base, ~this._is_negative, this._limbs);
	}

	negate() {
		// TODO optimize but be careful with side effects
		return this.opposite().move(this);
	}

	abs() {
		return this.sign() >= 0 ? this : this.opposite();
	}

	iabs() {
		return this.abs().move(this);
	}

	sign() {
		return this.iszero() ? 0 : this._is_negative ? -1 : 1;
	}

	iszero() {
		return jz(this._limbs, 0, this._limbs.length);
	}

	isone() {
		if (this._is_negative) return false;
		return eq(this._limbs, 0, this._limbs.length, [1], 0, 1);
	}

	isnonzero() {
		return !this.iszero();
	}

	isnegative() {
		return this._is_negative === -1;
	}

	ispositive() {
		return this.sign() > 0;
	}

	isnonnegative() {
		return !this.isnegative();
	}

	isnonpositive() {
		return !this.ispositive();
	}

	parity() {
		// TODO optimize this, there is a much faster way to test for parity
		// when the base is a multiple of two
		return this.modn(2);
	}

	iseven() {
		return this.parity().iszero();
	}

	isodd() {
		return !this.iseven();
	}

	bin() {
		return this.toString(2);
	}

	oct() {
		return this.toString(8);
	}

	hex() {
		return this.toString(16);
	}

	toJSON() {
		return this.hex();
	}

	digits(base = DEFAULT_DISPLAY_BASE) {
		// TODO Once #to is implemented we can rewrite this as
		// return this.to(LITTLE_ENDIAN, base, Array) ;
		return convert(
			this._base,
			base,
			this._limbs,
			0,
			this._limbs.length,
		).reverse();
	}

	bits() {
		return this.digits(2);
	}

	divides(other) {
		return other.mod(this).iszero();
	}

	divide_knowing_divisible_by(other) {
		// TODO optimize
		return this.div(other);
	}

	cmp(other) {
		// TODO optimize with _trim_positive

		if (this.iszero()) {
			if (other.iszero()) return 0;
			if (other._is_negative) return 1;
			return -1;
		}

		if (this._is_negative < other._is_negative) return -1;
		if (this._is_negative > other._is_negative) return 1;

		const a = this._limbs;
		const b = other._limbs_in_base(this._base);

		return this._is_negative === 0
			? cmp(a, 0, a.length, b, 0, b.length)
			: cmp(b, 0, b.length, a, 0, a.length);
	}

	cmpn(number) {
		return this.cmp(_from_number(number));
	}

	eq(other) {
		return this.cmp(other) === 0;
	}

	eqn(number) {
		return this.cmpn(number) === 0;
	}

	ge(other) {
		return this.cmp(other) >= 0;
	}

	gen(number) {
		return this.cmpn(number) >= 0;
	}

	gt(other) {
		return this.cmp(other) > 0;
	}

	gtn(number) {
		return this.cmpn(number) > 0;
	}

	le(other) {
		return this.cmp(other) <= 0;
	}

	len(number) {
		return this.cmpn(number) <= 0;
	}

	lt(other) {
		return this.cmp(other) < 0;
	}

	ltn(number) {
		return this.cmpn(number) < 0;
	}

	ne(other) {
		return this.cmp(other) !== 0;
	}

	nen(number) {
		return this.cmpn(number) !== 0;
	}

	gcd(other) {
		const r = this._base;
		const a = this._limbs;
		const b = other._limbs_in_base(r);
		const [d, di, dj] = euclidean_algorithm(r, a, 0, a.length, b, 0, b.length);
		const gcd = _alloc(dj - di);
		_copy(d, di, dj, gcd, 0);
		return new Integer(r, 0, gcd);
	}

	egcd(other) {
		const r = this._base;
		const a = this._limbs;
		const b = other._limbs_in_base(r);
		const [
			R0,
			R0i,
			S0,
			S0i,
			T0,
			T0i,
			S1,
			S1i,
			T1,
			T1i,
			steps,
		] = extended_euclidean_algorithm(r, a, 0, a.length, b, 0, b.length);
		const gcd = _alloc(R0.length - R0i);
		_copy(R0, R0i, R0.length, gcd, 0);
		const x = _alloc(S0.length - S0i);
		_copy(S0, S0i, S0.length, x, 0);
		const y = _alloc(T0.length - T0i);
		_copy(T0, T0i, T0.length, y, 0);
		const u = _alloc(S1.length - S1i);
		_copy(S1, S1i, S1.length, u, 0);
		const v = _alloc(T1.length - T1i);
		_copy(T1, T1i, T1.length, v, 0);
		return {
			// TODO use immutable zero
			gcd: new Integer(r, 0, gcd),
			x:
				x.length > 0
					? new Integer(r, this._is_negative ^ ((steps % 2) - 1), x)
					: new Integer(r, 0, [0]),
			y:
				y.length > 0
					? new Integer(r, other._is_negative ^ -(steps % 2), y)
					: new Integer(r, 0, [0]),
			u:
				u.length > 0
					? new Integer(r, this._is_negative ^ -(steps % 2), u)
					: new Integer(r, 0, [0]),
			v:
				v.length > 0
					? new Integer(r, other._is_negative ^ ((steps % 2) - 1), v)
					: new Integer(r, 0, [0]),
		};
	}

	valueOf() {
		if (this.gtn(MAX_NUMBER))
			throw new ValueError(
				`Cannot call valueOf on Integer larger than ${MAX_NUMBER}. Got ${this.toString()}`,
			);
		if (this.ltn(MIN_NUMBER))
			throw new ValueError(
				`Cannot call valueOf on Integer smaller than ${MIN_NUMBER}. Got ${this.toString()}`,
			);

		const limbs = convert(
			this._base,
			MAX_BASE,
			this._limbs,
			0,
			this._limbs.length,
		);

		const sign = this._is_negative ? -1 : 1;

		const value =
			limbs.length === 2 ? limbs[0] * MAX_BASE + limbs[1] : limbs[0];

		return sign * value;
	}

	toNumber() {
		return this.valueOf();
	}
}
