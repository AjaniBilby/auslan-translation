// deno-lint-ignore-file no-inferrable-types
import { SignID, dataset, signMap } from "../dataset.ts";

export class Terminal {
	opts: SignID[];
	length: number;

	constructor(options: SignID[]) {
		this.opts = options;
		this.length = this.opts.length;
	}


	*get(index: number, sign: boolean = false) {
		if (sign) {
			yield signMap.get(this.opts[index])?.tokenID;
		} else {
			yield signMap.get(this.opts[index])?.title
		}
	}
}