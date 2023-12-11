import { LazyBranch } from "~/grammar/tree/shared.ts";
import { Tense } from "~/grammar/tree/terminal.ts";

export class Sequence implements LazyBranch {
	seq: LazyBranch[];
	length: number;

	constructor(seq: LazyBranch[]) {
		this.seq = seq;

		this.length = 1;
		for (const child of this.seq) {
			this.length *= child.length;
		}
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

	*rand(tense: Tense) {
		for (const child of this.seq) {
			yield* child.rand(tense);
		}
	}

	*get(index: number, sign: boolean, tense: Tense) {
		for (const child of this.seq) {
			const len = child.length;
			yield* child.get(index % len, sign, tense);
			index = Math.floor(index/len);
		}
	}
}