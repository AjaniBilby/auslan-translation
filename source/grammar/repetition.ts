import { Terminal } from "./terminal.ts";

export class Repetition {
	child: Terminal;
	min: number;
	range: number;
	length: number;

	constructor(child: Terminal, min: number, max: number) {
		this.child = child;

		this.range = max-min + 1;
		this.min = min;

		this.length = min === 0 ? 1 : 0;
		for (let i = min; i <= max; i++) {
			this.length += this.child.length ** i;
		}
	}


	*get(index: number, sign: boolean = false) {
		if (this.min === 0) {
			if (index === 0) return;
			index -= 1;
		}

		for (let i=0; i<this.range; i++) {
			yield* this.child.get(index % this.child.length, sign);

			if (index === 0) break;
			index = Math.floor(index/this.child.length);
		}
	}
}