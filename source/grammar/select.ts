
import { Terminal } from "./terminal.ts";

export class Select {
	children: Terminal[];
	length: number;

	constructor(seq: Terminal[]) {
		this.children = seq;

		this.length = 0;
		for (const child of this.children) {
			this.length += child.length;
		}
	}


	*get(index: number, sign: boolean = false) {
		const choice = index % this.children.length;
		console.log(choice, index);
		index = Math.floor(index/this.children.length);
		console.log(" ", index);
		yield* this.children[choice].get(index, sign);
	}
}