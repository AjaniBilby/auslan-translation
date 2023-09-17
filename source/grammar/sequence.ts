import { LazyBranch } from "./shared.ts";
import { Tense } from "./terminal.ts";

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


	*get(index: number, sign: boolean, tense: Tense) {
		for (const child of this.seq) {
			const len = child.length;
			yield* child.get(index % len, sign, tense);
			index = Math.floor(index/len);
		}
	}
}