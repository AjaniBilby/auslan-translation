export function CalculateEntropy(
	histogram: { [key: string]: number },
	total: number
): number {
	let tally = 0;
	for (const key in histogram) {
		if (histogram[key] === 0) continue;

		const prob = histogram[key]/total;
		tally += prob * Math.log2(prob);
	}

	return -tally;
}

export function EstEntropy(
	histogram: { [key: string]: number },
	total: number, entropy: number, sampleLength: number,
	sample: Generator<number> | number[]
): number {
	const newTotal = total + sampleLength;

	for (const token of sample) {
		if (histogram[token]) {
			// remove old influence
			const p = histogram[token]/total;
			entropy += p * Math.log2(p);
			// add new influence
			const pn = (histogram[token]+1)/newTotal;
			entropy -= pn * Math.log2(p);
		}
	}

	return entropy;
}

export function AddHistogramEntry(histogram: { [key: string]: number }, tokens: Generator<number> | number[]) {
	for (const token of tokens) {
		histogram[token] = (histogram[token] || 0) + 1;
	}
}
export function SubHistogramEntry(histogram: { [key: string]: number }, tokens: number[]) {
	for (const token of tokens) {
		histogram[token] -= 1;
	}
}

export function HasHistogramOverlap(histogram: { [key: string]: number }, tokens: Generator<number>) {
	for (const token of tokens) {
		if (histogram[token]) return true;
	}
	return false;
}

export function FullyOverlapsHistogram(histogram: { [key: string]: number }, tokens: Generator<number>) {
	for (const token of tokens) {
		if (!histogram[token]) return false;
	}
	return true;
}