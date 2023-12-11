import { AddHistogramEntry, CalculateEntropy, EstEntropy, FullyOverlapsHistogram, HasHistogramOverlap } from "~/generate/histogram.ts";
import { LazySequence, msToDuration } from "~/helper.ts";
import { Translation, SignRef } from "~/generate/generator.ts";


class Option{
	index: number;
	entropy: number;
	length: number;

	constructor(index: number, entropy: number, length: number) {
		this.index = index;
		this.entropy = entropy;
		this.length = length;
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

function WriteText(text: string) {
	Deno.stdout.writeSync(new TextEncoder().encode(text));
}


const HIGH_WATER_MARK = 2**18;
function* ShuffleSet(x: number): Generator<number, void, unknown> {
	// Prevent memory overflow
	if (x > HIGH_WATER_MARK) {
		console.warn(`WARN: Hit high water mark for possible LazySequences, using a random subset of ${HIGH_WATER_MARK} instead`)
		yield* RandomSet(x);
		return;
	}

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


export function Entropify(text: LazySequence<string | SignRef>, tokens: LazySequence<number>, take: number): Translation[] {
	// Calculate the list of indices
	const length = tokens.length;
	const indices = new Set<number>();
	const out: Translation[] = [];
	take = Math.min(length, take);

	const histogram: { [key: string]: number } = {};
	const start = Date.now();
	let totalTokens = 0;

	// Quick fill, look for fully unique sequences first
	console.time("  quick fill");
	for (let idx of ShuffleSet(length-1)) {
		if (!HasHistogramOverlap(histogram, tokens.get(idx))) {
			// Add translation
			const sampleTokens = [...tokens.get(idx)];
			const sampleText = [...text.get(idx)].join(" ");
			out.push(new Translation(sampleText, sampleTokens));

			// Update state
			AddHistogramEntry(histogram, sampleTokens);
			totalTokens += sampleTokens.length;
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
		const sampleText = [...text.get(opt.index)].join(" ");
		out.push(new Translation(sampleText, sampleTokens));
		indices.delete(opt.index);

		// Update state
		entropy = CalculateEntropy(histogram, totalTokens);
		AddHistogramEntry(histogram, sampleTokens);
		totalTokens += sampleTokens.length;
	}



	// Medium fill using full entropy calculations
	console.time("  medium fill");
	const partialIndices = new Set<number>();
	for (const idx of indices) {
		if (!FullyOverlapsHistogram(histogram, tokens.get(idx))) {
			partialIndices.add(idx);
		}
	}

	WriteText("estimating duration...");
	while (partialIndices.size > 0 && out.length < take) {
		// Take best options
		const options: Option[] = [];
		for (const idx of indices) {
			if (FullyOverlapsHistogram(histogram, tokens.get(idx))) {
				partialIndices.delete(idx);
				continue;
			}

			const length = tokens.lengthAt(idx);
			const e = EstEntropy(histogram, totalTokens, entropy, length, tokens.get(idx));
			if (!IsEntropyWorthy(options, e)) continue;
			InsertOption(options, new Option(idx, e, length));
		}

		// Add the best 10 of 100
		for (let i=0; i<10; i++) {
			const target = options.pop();
			if (!target) break;

			partialIndices.delete(target.index);
			AddOption(target);

			// Update option's entropies
			for (const opt of options) {
				opt.entropy = EstEntropy(histogram, totalTokens, entropy, opt.length, tokens.get(opt.index));
			}
			options.sort(OptionSorter);
		}

		const duration = Date.now() - start;
		const total = duration / ( out.length/take );
		const remaining = total-duration;
		WriteText(`\r  ${take-out.length} remaining ${msToDuration(remaining)} (${indices.size})    `);
	}
	WriteText(`\r                                                           \r`);
	console.timeEnd("  medium fill");



	// Slow fill using full entropy calculations
	WriteText("estimating duration...");
	console.time("  slow fill");
	while (indices.size > 0 && out.length < take) {
		// Take best options
		const options: Option[] = [];
		for (const idx of indices) {
			const length = tokens.lengthAt(idx);
			const e = EstEntropy(histogram, totalTokens, entropy, length, tokens.get(idx));
			if (!IsEntropyWorthy(options, e)) continue;
			InsertOption(options, new Option(idx, e, length));
		}

		// Add the best 10 of 100
		for (let i=0; i<10; i++) {
			const target = options.pop();
			if (!target) break;
			AddOption(target);

			// Update option's entropies
			for (const opt of options) {
				opt.entropy = EstEntropy(histogram, totalTokens, entropy, opt.length, tokens.get(opt.index));
			}
			options.sort(OptionSorter);
		}

		if (out.length % 10 === 0) {
			const duration = Date.now() - start;
			const total = duration / ( out.length/take );
			const remaining = total-duration;
			WriteText(`\r  ${take-out.length} remaining ${msToDuration(remaining)} (${indices.size})    `);
		}
	}
	WriteText(`\r                                                           \r`);
	console.timeEnd("  slow fill");
	console.log(`  Entropy: ${entropy}`);

	return out;
}