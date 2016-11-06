"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports._build = _build;
function _build(base, number) {

	var data = [];

	var q = number;
	var d = base;

	while (q >= d) {
		var r = q % d;
		data.push(r);
		q = (q - r) / d;
	}

	data.push(q);

	return data.reverse();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy8xLW5ldy9jb252ZXJ0L19idWlsZC5qcyJdLCJuYW1lcyI6WyJfYnVpbGQiLCJiYXNlIiwibnVtYmVyIiwiZGF0YSIsInEiLCJkIiwiciIsInB1c2giLCJyZXZlcnNlIl0sIm1hcHBpbmdzIjoiOzs7OztRQUNnQkEsTSxHQUFBQSxNO0FBQVQsU0FBU0EsTUFBVCxDQUFrQkMsSUFBbEIsRUFBeUJDLE1BQXpCLEVBQWtDOztBQUV4QyxLQUFNQyxPQUFPLEVBQWI7O0FBRUEsS0FBSUMsSUFBSUYsTUFBUjtBQUNBLEtBQU1HLElBQUlKLElBQVY7O0FBRUEsUUFBUUcsS0FBS0MsQ0FBYixFQUFpQjtBQUNoQixNQUFNQyxJQUFJRixJQUFJQyxDQUFkO0FBQ0FGLE9BQUtJLElBQUwsQ0FBV0QsQ0FBWDtBQUNBRixNQUFJLENBQUVBLElBQUlFLENBQU4sSUFBWUQsQ0FBaEI7QUFDQTs7QUFFREYsTUFBS0ksSUFBTCxDQUFXSCxDQUFYOztBQUVBLFFBQU9ELEtBQUtLLE9BQUwsRUFBUDtBQUVBIiwiZmlsZSI6Il9idWlsZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGZ1bmN0aW9uIF9idWlsZCAoIGJhc2UgLCBudW1iZXIgKSB7XG5cblx0Y29uc3QgZGF0YSA9IFsgXSA7XG5cblx0bGV0IHEgPSBudW1iZXIgO1xuXHRjb25zdCBkID0gYmFzZSA7XG5cblx0d2hpbGUgKCBxID49IGQgKSB7XG5cdFx0Y29uc3QgciA9IHEgJSBkIDtcblx0XHRkYXRhLnB1c2goIHIgKSA7XG5cdFx0cSA9ICggcSAtIHIgKSAvIGQgO1xuXHR9XG5cblx0ZGF0YS5wdXNoKCBxICkgO1xuXG5cdHJldHVybiBkYXRhLnJldmVyc2UoICkgO1xuXG59XG4iXX0=