import { Translation, SignRef } from "./generator.ts";
import { LazySamples } from "./lazy.ts";


class Option{
	index: number;
	entropy: number;

	constructor(index: number, entropy: number) {
		this.index = index;
		this.entropy = entropy;
	}
}

function OptionSorter(a: Option, b: Option) {
	return a.entropy - b.entropy;
}

function InsertOption(arr: Option[], opt: Option) {
	if (arr.length === 0) {
		arr.push(opt);
		return;
	}

	for (let i=0; i<arr.length; i++) {
		if (opt.entropy > arr[i].entropy) {
			arr.splice(i, 0, opt);
			break;
		}
	}

	arr.length = Math.min(arr.length, 100);
}

function IsEntropyWorthy(arr: Option[], entropy: number) {
	const last = arr[arr.length-1];
	if (!last) return true;

	return entropy > last.entropy;
}


const HIGH_WATER_MARK = 2**18;
function* ShuffleSet(x: number): Generator<number, void, unknown> {
	// Prevent memory overflow
	if (x > HIGH_WATER_MARK) {
		for (const val of RandomSet(x)) {
			yield val;
		}

		return;
	};

	const indices = Array.from({ length: x + 1 }, (_, i) => i);
	for (let i = indices.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[indices[i], indices[j]] = [indices[j], indices[i]];
			yield indices[i];
	}

	yield indices[0];
}

function* RandomSet(x: number): Generator<number, void, unknown> {
	for (let i=0; i<HIGH_WATER_MARK; i++) {
		yield Math.floor(x * Math.random());
	}
}


export function Entropify(text: LazySamples<SignRef | string>, tokens: LazySamples<number>, take: number): Translation[] {
	// Calculate the list of indices
	const length = tokens.getLength();
	const indices = new Set<number>();
	const out: Translation[] = [];
	take = Math.min(length, take);

	const sampleLength = tokens.getSampleLength();
	const histogram: { [key: string]: number } = {};
	const start = Date.now();
	let totalTokens = 0;

	// Quick fill, look for fully unique sequences first
	console.time("  quick fill");
	for (let idx of ShuffleSet(length-1)) {
		if (!HasHistogramOverlap(histogram, tokens.get(idx))) {
			// Add translation
			const sampleTokens = [...tokens.get(idx)];
			const sampleText = [...text.get(idx)].join("");
			out.push(new Translation(sampleText, sampleTokens));

			// Update state
			AddHistogramEntry(histogram, sampleTokens);
			totalTokens += sampleLength;
		} else {
			indices.add(idx);
		}

		if (out.length >= take) {
			break;
		}
	}
	console.timeEnd("  quick fill");



	let entropy = CalculateEntropy(histogram, totalTokens);
	function AddOption(opt: Option) {
		const sampleTokens = [...tokens.get(opt.index)];
		const sampleText = [...text.get(opt.index)].join("");
		out.push(new Translation(sampleText, sampleTokens));
		indices.delete(opt.index);

		// Update state
		entropy = CalculateEntropy(histogram, totalTokens);
		AddHistogramEntry(histogram, sampleTokens);
		totalTokens += sampleLength;
	}



	// Medium fill using full entropy calculations
	console.time("  medium fill");
	const partialIndices = new Set<number>();
	for (const idx of indices) {
		if (!FullyOverlapsHistogram(histogram, tokens.get(idx))) {
			partialIndices.add(idx);
		}
	}

	process.stdout.write("estimating duration...");
	while (partialIndices.size > 0 && out.length < take) {
		// Take best options
		let options: Option[] = [];
		for (const idx of indices) {
			if (FullyOverlapsHistogram(histogram, tokens.get(idx))) {
				partialIndices.delete(idx);
				continue;
			};

			const e = EstEntropy(histogram, totalTokens, entropy, sampleLength, tokens.get(idx));
			if (!IsEntropyWorthy(options, e)) continue;
			InsertOption(options, new Option(idx, e));
		}

		// Add the best 10 of 100
		for (let i=0; i<10; i++) {
			const target = options.pop();
			if (!target) break;

			partialIndices.delete(target.index);
			AddOption(target);

			// Update option's entropies
			for (const opt of options) {
				opt.entropy = EstEntropy(histogram, totalTokens, entropy, sampleLength, tokens.get(opt.index));
			}
			options.sort(OptionSorter);
		}

		if (out.length % 100 === 0) {
			const duration = Date.now() - start;
			const total = duration / ( out.length/take );
			const remaining = total-duration;
			process.stdout.write(`\r  ${take-out.length} remaining ${msToDuration(remaining)} (${indices.size})    `);
		}
	}
	process.stdout.write(`\r                                                           \r`);
	console.timeEnd("  medium fill");



	// Slow fill using full entropy calculations
	process.stdout.write("estimating duration...");
	console.time("  slow fill");
	while (indices.size > 0 && out.length < take) {
		// Take best options
		let options: Option[] = [];
		for (const idx of indices) {
			const e = EstEntropy(histogram, totalTokens, entropy, sampleLength, tokens.get(idx));
			if (!IsEntropyWorthy(options, e)) continue;
			InsertOption(options, new Option(idx, e));
		}

		// Add the best 10 of 100
		for (let i=0; i<10; i++) {
			const target = options.pop();
			if (!target) break;
			AddOption(target);

			// Update option's entropies
			for (const opt of options) {
				opt.entropy = EstEntropy(histogram, totalTokens, entropy, sampleLength, tokens.get(opt.index));
			}
			options.sort(OptionSorter);
		}

		if (out.length % 100 === 0) {
			const duration = Date.now() - start;
			const total = duration / ( out.length/take );
			const remaining = total-duration;
			process.stdout.write(`\r  ${take-out.length} remaining ${msToDuration(remaining)} (${indices.size})    `);
		}
	}
	process.stdout.write(`\r                                                           \r`);
	console.timeEnd("  slow fill");
	console.log(`  Entropy: ${entropy}`);

	return out;
}

function msToDuration(ms: number) {
	let total_seconds = Math.floor(ms / 1000);
	let seconds = total_seconds % 60;
	let minutes = Math.floor(total_seconds / 60);

	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function CalculateEntropy(histogram: { [key: string]: number }, total: number): number {
	let tally = 0;
	for (const key in histogram) {
		if (histogram[key] === 0) continue;

		const prob = histogram[key]/total;
		tally += prob * Math.log2(prob);
	}

	return -tally;
}

function EstEntropy(
	histogram: { [key: string]: number },
	total: number, entropy: number, sampleLength: number,
	sample: Generator<number> | number[]
): number {
	const newTotal = total + sampleLength;

	for (const token of sample) {
		if (histogram[token]) {
			const p = histogram[token]/total;
			entropy += p * Math.log2(p);
			const pn = (histogram[token]+1)/newTotal;
			entropy -= pn * Math.log2(p);
		} else {
			const pn = 1/newTotal;
			entropy -= pn * Math.log2(pn);
		}
	}

	return entropy;
}

function AddHistogramEntry(histogram: { [key: string]: number }, tokens: Generator<number> | number[]) {
	for (const token of tokens) {
		histogram[token] = (histogram[token] || 0) + 1;
	}
}
function SubHistogramEntry(histogram: { [key: string]: number }, tokens: number[]) {
	for (const token of tokens) {
		histogram[token] -= 1;
	}
}

function HasHistogramOverlap(histogram: { [key: string]: number }, tokens: Generator<number>) {
	for (const token of tokens) {
		if (histogram[token]) return true;
	}
	return false;
}

function FullyOverlapsHistogram(histogram: { [key: string]: number }, tokens: Generator<number>) {
	for (const token of tokens) {
		if (!histogram[token]) return false;
	}
	return true;
}