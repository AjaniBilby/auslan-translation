export function Panic(x: string, source?: SourceMap): never {
	if (source) {
		console.error(x + SourceView(source.path, source.name, source.ref));
	} else {
		console.error(x);
	}
	Deno.exit(1);
}