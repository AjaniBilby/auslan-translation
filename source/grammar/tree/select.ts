
import { LazyBranch } from "./shared.ts";
import { Tense } from "./terminal.ts";

export class Select implements LazyBranch {
	children: LazyBranch[];
	length: number;

	constructor(seq: LazyBranch[]) {
		this.children = seq;

		this.length = 0;
		for (const child of this.children) {
			this.length += child.length;
		}
	}


	*get(index: number, sign: boolean, tense: Tense) {
		for (const child of this.children) {
			if (index > child.length) {
				index -= child.length;
				continue;
			}

			yield* child.get(index, sign, tense)
			return;
		}

		throw new Error(`Index oversized, unable to find child selection`);
	}
}