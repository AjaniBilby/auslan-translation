export class LazySamples<T> {
	options: T[][];
	order: number[];
	_key: Uint32Array;

	constructor(options: T[][], order: number[]) {
		this.options = options;
		this.order = order;
		this._key = new Uint32Array(this.options.length);
	}

	getDepth() {
		return this.options.reduce((s, x) => Math.max(s, x.length), 0);
	}

	getLength() {
		const domain = this.options.reduce((s, x) => s*x.length, 1);
		if (domain >= Number.MAX_SAFE_INTEGER) console.warn(
			`Too many possible states to represent safely. ${domain} >= ${Number.MAX_SAFE_INTEGER}`
		);

		return domain;
	}

	getSampleLength() {
		return this.options.length;
	}

	*get(index: number): Generator<T, void, unknown> {
		for (const i of this.order) {
			const axis = this.options[i];
			this._key[i] = index % axis.length;
			index = Math.floor(index / axis.length);
		}

		for (let i=0; i<this.order.length; i++) {
			yield this.options[i][this._key[i]];
		}
	}
}