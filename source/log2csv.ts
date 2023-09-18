/// <reference lib="deno.ns" />
import { readLines } from "https://deno.land/std@0.201.0/io/mod.ts";

const table = [];
let row: string[] = ["Epoch", "p25 loss", "p50 loss", "p75 loss", "mean loss", "total seq acc", "avg seq acc"];


console.log("Please enter multiple lines of the training logs (enter blank line to end):");

for await (const line of readLines(Deno.stdin)) {
	if (line === "") break;

	if (line.startsWith("Epoch: ")) {
		// Push the previous row to the table
		table.push(row);
		row = [];

		const s = line.indexOf(" ");
		const e = line.indexOf(',');
		row.push(line.slice(s, e).trim());
	} else if (line.startsWith("  Loss: ")) {
		const frag = line.slice("  Loss: ".length).split(" ");
		row.push(frag[1]);
		row.push(frag[3]);
		row.push(frag[5]);
	} else if (line.startsWith("   Avg: ")) {
		row.push(line.slice("   Avg: ".length));
	} else if (line.startsWith("  Total Seq Acc: ")) {
		row.push(line.slice("  Total Seq Acc: ".length));
	} else if (line.startsWith("    Avg Seq Acc: ")) {
		row.push(line.slice("    Avg Seq Acc: ".length));
	} else {
		console.log(line);
	}
}

table.push(row);

Deno.writeTextFileSync(
	`./dump.csv`,
	table
		.map(x => x.join(","))
		.join("\n")
);

console.log("Saved dump.csv");