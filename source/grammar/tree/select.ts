
import { LazyBranch } from "~/grammar/tree/shared.ts";
import { Tense } from "~/grammar/tree/terminal.ts";

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

	lengthAt(index: number): number {
		for (const child of this.children) {
			if (index > child.length) {
				index -= child.length;
				continue;
			}

			return child.lengthAt(index);
		}

		throw new Error(`Index oversized, unable to find child selection`);
	}

	*rand(tense: Tense) {
		const choice = Math.floor(Math.random()*this.children.length);
		const child = this.children[choice];

		yield* child.rand(tense);
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