/// <reference lib="deno.ns" />

import * as Parser from "~/bnf/syntax.js";
import { TreeSeqWrapper } from "~/grammar/tree/wrapper.ts";
import { TransformMode } from "~/grammar/tree/transform.ts";
import { LazySequence } from "~/helper.ts";
import { Translation } from "~/generate/generator.ts";
import { Entropify } from "~/generate/entropy.ts";
import { SENTENCE } from "~/grammar/tree/index.ts";
import { Tense } from "~/grammar/tree/terminal.ts";
await Parser.ready;




TransformMode(true); // apply order transformations
const target = SENTENCE;
function RandomSamples() {
	const questions = [] as Translation[];

	for (let i=0; i<500_000; i++) {
		const sample = [...target.rand(Tense.NONE)];

		questions.push(
			new Translation(
				sample.map(x => x[1]).join(" ")
					.toLowerCase()
					.replace(/\n/g, " ")
					.replace(/-/g, " ")
					.replace(/'/g, "")
					.replace(/[^a-z0-9 ]/g, "")
					.replace(/  /g, " ")
					.trim(),
				sample.map(x => x[0]).filter(x => !isNaN(x))
			)
		)
	}

	Save(questions);
}


function EntropicSamples() {
	console.log(`Entropifying ${target.length}`);
	const title = `  Time`;
	console.time(title);
	const questions = Entropify(
		new TreeSeqWrapper(SENTENCE, false, Tense.NONE) as LazySequence<string>,
		new TreeSeqWrapper(SENTENCE, true, Tense.NONE) as LazySequence<number>,
		7_000
	);
	console.timeEnd(title);

	Save(questions);
}


function Save(questions: Translation[]) {
	const csv = questions
		.map(x => `"${x.text}","${x.sequence.join(",")}"`)
		.join("\n") || "";
	Deno.writeTextFileSync(`./concept/grammar.csv`, csv);
}


RandomSamples();