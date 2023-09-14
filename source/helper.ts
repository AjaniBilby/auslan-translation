export function Panic(x: string): never {
	console.error(x);
	Deno.exit(1);
}