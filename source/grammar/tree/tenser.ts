import { LazyBranch } from "~/grammar/tree/shared.ts";
import { Tense } from "~/grammar/tree/terminal.ts";

export class Tenser implements LazyBranch {
	child: LazyBranch;
	opts:  Tense[];
	length: number;

	constructor(child: LazyBranch, tenses: Tense[]) {
		this.child = child;
		this.opts = tenses;

		this.length = this.child.length * this.opts.length;
	}

	lengthAt(index: number): number {
		return this.child.lengthAt(index);
	}

	*rand(_tense: Tense) {
		const choice = Math.floor(Math.random()*this.opts.length);
		yield* this.child.rand(this.opts[choice]);
	}

	*get(index: number, sign: boolean, _tense: Tense) {
		const choice = index % this.opts.length;
		index = Math.floor(index/this.opts.length);
		yield* this.child.get(index, sign, this.opts[choice]);
	}
}