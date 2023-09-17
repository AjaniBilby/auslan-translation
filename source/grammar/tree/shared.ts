import type { Tense } from "./terminal.ts";

export interface LazyBranch {
	length: number;
	get(index: number, sign: boolean, tense: Tense): Generator<number | string, void, unknown>;
}