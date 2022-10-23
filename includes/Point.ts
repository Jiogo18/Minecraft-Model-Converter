
// Define the type Point as an array of 3 numbers
export type Point = [number, number, number];
export type Face = "north" | "south" | "east" | "west" | "up" | "down";
export type Box = [number, number, number, number, number, number];
export type UV = [number, number, number, number];

export function roundAtDecimal(n: number, d: number): number {
	const factor = Math.pow(10, d);
	return Math.round(n * factor) / factor;
}
export function roundPoint(p: Point): Point {
	return [roundAtDecimal(p[0], 10), roundAtDecimal(p[1], 10), roundAtDecimal(p[2], 10)];
}
// function for -Point
export function minusPoint(p: Point): Point {
	return [-p[0], -p[1], -p[2]];
}
export function minusPoints(a: Point, b: Point): Point {
	return roundPoint([a[0] - b[0], a[1] - b[1], a[2] - b[2]]);
}
export function addPoints(...p: Point[]): Point {
	return roundPoint([
		p.reduce((p, v) => p + v[0], 0),
		p.reduce((p, v) => p + v[1], 0),
		p.reduce((p, v) => p + v[2], 0),
	]);
}

export function rotateAroundAxis(a: "x" | "y" | "z", p: Point, angle: number): Point {
	const cos = Math.cos(angle * Math.PI / 180);
	const sin = Math.sin(angle * Math.PI / 180);
	const x = p[0];
	const y = p[1];
	const z = p[2];
	switch (a) {
		case "x":
			return [x, y * cos - z * sin, y * sin + z * cos];
		case "y":
			return [x * cos + z * sin, y, -x * sin + z * cos];
		case "z":
			return [x * cos - y * sin, x * sin + y * cos, z];
	}
}

export function isNullPoint(rotate: Point | undefined): boolean {
	if (rotate === undefined) {
		return true;
	}
	return rotate.every(v => v === 0);
}

export function moveBox(box: Box, origin: Point): Box {
	return [
		...minusPoints([box[0], box[1], box[2]], origin),
		box[3],
		box[4],
		box[5],
	];
}
