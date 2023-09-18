import { LazyBranch } from "./shared.ts";
import { Tense } from "./terminal.ts";

let APPLY_TRANSFORMATION = true;

export function TransformMode(applied: boolean) {
	APPLY_TRANSFORMATION = applied;
}

export class Transform implements LazyBranch {
	seq: LazyBranch[];
	order: number[];
	length: number;

	constructor(seq: LazyBranch[], order: number[]) {
		this.seq = seq;

		this.length = 1;
		for (const child of this.seq) {
			this.length *= child.length;
		}

		// Check the order list supplied is valid
		for (let i=0; i<order.length; i++) {
			const idx = order[i];
			if (idx >= this.seq.length) throw new Error(`Order Index ${idx} out of bounds`);

			for (let j=0; j<i; j++) {
				if (order[j] === idx) throw new Error(`Order Index ${idx} is used twice`);
			}
		}
		this.order = order;
	}

	lengthAt(index: number): number {
		let tally = 0;
		for (const child of this.seq) {
			const len = child.length;
			tally += child.lengthAt(index % len);

			if (index === 0) break;
			index = Math.floor(index/len);
		}

		return tally;
	}

	*rand(tense: Tense): Generator<[number, string], void, unknown> {
		const cache: Array<[number, string][]> = [];
		for (const child of this.seq) {
			cache.push([...child.rand(tense)]);
		}


		const signs: Array<number> = [];
		const words: Array<string> = [];

		for (let i=0; i<cache.length; i++) {
			signs.push(...cache[i].map(x => x[0]));
		}

		for (let i=0; i<cache.length; i++) {
			const idx = APPLY_TRANSFORMATION ? this.order[i] : i;
			words.push(...cache[idx].map(x => x[1]));
		}

		const len = Math.max(signs.length, words.length);
		for (let i=0; i<len; i++) {
			yield [
				signs[i],
				words[i]
			];
		}
	}

	*get(index: number, sign: boolean, tense: Tense) {
		if (sign || !APPLY_TRANSFORMATION) {
			for (const child of this.seq) {
				const len = child.length;
				yield* child.get(index % len, sign, tense);
				index = Math.floor(index/len);
			}

			return;
		}


		const indices = this.seq.map(child => {
			const len = child.length;
			const out = index % len;
			index = Math.floor(index/len);

			return out;
		});

		for (let i=0; i<this.order.length; i++) {
			yield* this.seq[i].get(indices[i], sign, tense);
		}
	}
}