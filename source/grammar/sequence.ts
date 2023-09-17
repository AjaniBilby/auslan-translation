import { Terminal } from "./terminal.ts";

export class Sequence {
	seq: Terminal[];
	length: number;

	constructor(seq: Terminal[]) {
		this.seq = seq;

		this.length = 1;
		for (const child of this.seq) {
			this.length *= child.length;
		}
	}


	*get(index: number, sign: boolean = false) {
		for (const child of this.seq) {
			const len = child.length;
			yield* child.get(index % len, sign);
			index = Math.floor(index/len);
		}
	}
}