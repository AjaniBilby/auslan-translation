// deno-lint-ignore-file no-inferrable-types
import { SignID, signMap } from "~/dataset.ts";
import { LazyBranch } from "~/grammar/tree/shared.ts";

export enum Tense {
	PAST,
	PRESENT,
	FUTURE,
	NONE
}

export class Terminal implements LazyBranch {
	opts: Array<string | SignID>;
	length: number;

	constructor(options: Array<string | SignID>) {
		this.opts = options;
		this.length = this.opts.length;
	}

	lengthAt(index: number): number {
		return 1;
	}

	*rand(tense: Tense) {
		const index = Math.floor(Math.random()*this.length);
		const sign = this.get(index, true, tense).next().value;
		const word = this.get(index, false, tense).next().value;

		yield [ sign, word ] as [number, string];
	}

	*get(index: number, sign: boolean, tense: Tense) {
		const target = this.opts[index];
		if (typeof target === "string") {
			if (!sign) yield target;
			return;
		}

		if (sign) {
			yield signMap.get(target)?.tokenID || NaN;
		} else {
			const sign = signMap.get(target);
			if (!sign) throw new Error(`Unknown sign id ${target}`);

			let text: undefined | string;
			switch (tense) {
				case Tense.PAST:    text = sign.tensePast; break;
				case Tense.PRESENT: text = sign.tenseCurrent; break;
				case Tense.FUTURE:  text = sign.tenseFuture; break;
				case Tense.NONE:    text = sign.title; break;
			}

			// Revert to title if tense info is missing
			if (text.length < 1) {
				text = sign.title;
			}

			yield text;
		}
	}
}