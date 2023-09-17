import { LazyBranch } from "./shared.ts";
import { Tense } from "./terminal.ts";

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


	*get(index: number, sign: boolean, tense: Tense) {
		if (sign) {
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