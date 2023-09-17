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

	lengthAt(index: number): number {
		if (this.min === 0) {
			if (index === 0) return 0;
			index -= 1;
		}

		let tally = 0;
		for (let i=0; i<this.range; i++) {
			tally += this.child.lengthAt(index % this.child.length);

			if (index === 0) break;
			index = Math.floor(index/this.child.length);
		}

		return tally;
	}

	*rand(tense: Tense) {
		const count = Math.random()*this.range + this.min;

		for (let i=0; i<count; i++) {
			yield* this.child.rand(tense);
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