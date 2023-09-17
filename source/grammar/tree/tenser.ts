
import { LazyBranch } from "./shared.ts";
import { Tense } from "./terminal.ts";

export class Tenser implements LazyBranch {
	child: LazyBranch;
	opts:  Tense[];
	length: number;

	constructor(child: LazyBranch, tenses: Tense[]) {
		this.child = child;
		this.opts = tenses;

		this.length = this.child.length * this.opts.length;
	}


	*get(index: number, sign: boolean, _tense: Tense) {
		const choice = index % this.opts.length;
		index = Math.floor(index/this.opts.length);
		yield* this.child.get(index, sign, this.opts[choice]);
	}
}