import type { Tense } from "./terminal.ts";

export interface LazyBranch {
	length: number;
	lengthAt(index: number): number;
	get(index: number, sign: boolean, tense: Tense): Generator<number | string, void, unknown>;

	rand(tense: Tense): Generator<[number, string], void, unknown>;
}