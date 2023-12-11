import { LazySequence } from "~/helper.ts";
import { LazyBranch } from "~/grammar/tree/shared.ts";
import { Tense } from "~/grammar/tree/terminal.ts";

export class TreeSeqWrapper implements LazySequence<string | number> {
	entry: LazyBranch;
	sign: boolean;
	tense: Tense;

	constructor(entry: LazyBranch, sign: boolean, tense: Tense) {
		this.entry = entry;
		this.tense = tense;
		this.sign  = sign;
	}

	get length() {
		return this.entry.length;
	}

	lengthAt(index: number): number {
		return this.entry.lengthAt(index);
	}

	*get(index: number) {
		yield* this.entry.get(index, this.sign, this.tense);
	}
}