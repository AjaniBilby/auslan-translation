import { LazyBranch } from "./shared.ts";
import { Tense } from "./terminal.ts";

export class Repetition implements LazyBranch {
	child: LazyBranch;
	min: number;
	range: number;
	length: number;

	constructor(child: LazyBranch, min: number, max: number) {
		this.child = child;

		this.range = max-min + 1;
		this.min = min;

		this.length = 0;
		for (let i = min; i <= max; i++) {
			this.length += this.child.length ** i; // any thing to the power of 0 is 1
		}
	}


	*get(index: number, sign: boolean, tense: Tense) {
		if (this.min === 0) {
			if (index === 0) return;
			index -= 1;
		}

		for (let i=0; i<this.range; i++) {
			yield* this.child.get(index % this.child.length, sign, tense);

			if (index === 0) break;
			index = Math.floor(index/this.child.length);
		}
	}
}