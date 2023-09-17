export function Panic(x: string): never {
	console.error(x);
	Deno.exit(1);
}

export function msToDuration(ms: number) {
	let total_seconds = Math.floor(ms / 1000);
	let seconds = total_seconds % 60;
	let minutes = Math.floor(total_seconds / 60);

	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


export interface LazySequence<T> {
	length: number;
	get(index: number): Generator<T, void, unknown>;
	lengthAt(index: number): number;
}