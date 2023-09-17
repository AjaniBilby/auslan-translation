/// <reference lib="deno.ns" />

import * as colors from "https://deno.land/std@0.201.0/fmt/colors.ts";

import * as Parser from "../bnf/syntax.js";
import { Tense, Terminal } from "./tree/terminal.ts";
import { Repetition } from "./tree/repetition.ts";
import { Transform } from "./tree/transform.ts";
import { Sequence } from "./tree/sequence.ts";
import { dataset } from "../dataset.ts";
import { Select } from "./tree/select.ts";
import { Tenser } from "./tree/tenser.ts";
import { TreeSeqWrapper } from "./tree/wrapper.ts";
import { Entropify } from "../generate/entropy.ts";
import { LazySequence } from "../helper.ts";
await Parser.ready;

const listID = {
	adjective: 177,
	adverb: 178,
	noun: 179,
	preposition: 181,
	verb: 177,
	questionSigns: 86,
}

const WHEN  = new Terminal(dataset.list[listID.questionSigns]);
const IF    = new Terminal([1920, 322, 1777,]);
const AND   = new Terminal(["and", "but", "or"]);

const ADJ  = new Terminal(dataset.list[listID.adjective]);
const ADV  = new Terminal(dataset.list[listID.adverb]);
const NOUN = new Terminal(dataset.list[listID.noun]);
const NP = new Transform([
	new Terminal(["a", "an", "the"]),
	NOUN,
	new Repetition(ADJ, 1, 1),
], [0, 2, 1]);
const PREP = new Sequence([
	new Repetition(new Terminal([1595]), 0, 1),
	new Terminal(dataset.list[listID.preposition])
]);
const LOCATION = NP;
const SUBJECT  = NP;
const OBJECT   = NP;


const VERB = new Select([
	new Transform([
		new Repetition(OBJECT, 0, 1),
		new Tenser(new Terminal(dataset.list[listID.verb]), [Tense.NONE]),
	], [1, 0]),
	new Terminal(dataset.list[listID.verb])
]);
const GER  = new Tenser(new Terminal(dataset.list[listID.verb]), [Tense.PRESENT]);


const FOGHORN = new Sequence([
	new Repetition(PREP, 0, 1),
	new Repetition(NP, 0, 1),
	OBJECT,
]);
const GERUND = new Select([FOGHORN, GER]);

const ADJECTIVE = new Select([
	GERUND,
	new Sequence([PREP, NP]),
	ADJ,
]);

const STATEMENT = new Transform([
	SUBJECT,
	new Repetition(ADJ, 0, 2),    // ADJ+
	new Repetition( new Select([  // STATEMENT-LESS ADVERB+
		ADV,
		GERUND,
		new Sequence([PREP, NP]),
	]), 0, 2),
	new Repetition(VERB, 0, 2),
	new Repetition(ADJECTIVE, 1, 3),
], [1, 2, 0, 4, 3]);

const ADVERB = new Select([
	ADV,
	new Sequence([WHEN, STATEMENT]),
	new Sequence([IF, STATEMENT]),
	GERUND,
	new Sequence([PREP, NP]),
]);

const CLAUSE = new Transform([
	SUBJECT,
	new Repetition(ADJECTIVE, 0, 2),
	new Repetition(ADVERB, 0, 2),
	VERB,
], [1, 2, 0, 3]);


const COMMAND = new Transform([
	VERB,
	new Repetition(ADJ, 1, 1),
	new Repetition(ADVERB, 1, 1),
], [1, 2, 0]);
const QUESTION = new Transform([
	new Repetition(new Terminal(dataset.list[listID.questionSigns]), 0, 1),
	new Repetition(ADJ, 0, 1),
	new Repetition(ADVERB, 1, 1),
	new Terminal(["DO"]),
	SUBJECT,
	new Repetition(ADJECTIVE, 1, 1),
	new Repetition(VERB, 0, 2),
], [0, 1, 2, 3, 4, 5, 6]);

const SENTENCE = new Select([STATEMENT, COMMAND, QUESTION, CLAUSE]);



const target = SENTENCE;
// for (let i=0; i<10; i++) {
// 	const i = Math.floor(Math.random()*target.length);

// 	console.log(">", [...target.get(i, false, Tense.NONE)].join(" "))
// }



console.log(`Entropifying ${target.length}`);
const title = `  Time`;
console.time(title);
const questions = Entropify(
	new TreeSeqWrapper(SENTENCE, false, Tense.NONE) as LazySequence<string>,
	new TreeSeqWrapper(SENTENCE, true, Tense.NONE) as LazySequence<number>,
	100
);
console.timeEnd(title);




const csv = questions
	.map(x => `"${x.text}","${x.sequence.join(",")}"`)
	.join("\n") || "";
Deno.writeTextFileSync(`./concept/grammar.csv`, csv);