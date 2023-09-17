/// <reference lib="deno.ns" />

import * as colors from "https://deno.land/std@0.201.0/fmt/colors.ts";

import * as Parser from "../bnf/syntax.js";
import { Tense, Terminal } from "./terminal.ts";
import { Sequence } from "./sequence.ts";
import { Select } from "./select.ts";
import { Repetition } from "./repetition.ts";
import { dataset } from "../dataset.ts";
import { Tenser } from "./tenser.ts";
await Parser.ready;

const listID = {
	adjective: 177,
	adverb: 178,
	noun: 179,
	preposition: 181,
	verb: 177,
}

const IF  = new Terminal(["and", "but", "or"]);
const AND  = new Terminal(["and", "but", "or"]);

const ADJ  = new Terminal(dataset.list[listID.adjective]);
const ADV  = new Terminal(dataset.list[listID.adverb]);
const NOUN = new Terminal(dataset.list[listID.noun]);
const NP = new Sequence([
	new Terminal(["a", "the"]),
	new Repetition(ADJ, 1, 3),
	NOUN
])
const PREP = new Sequence([
	new Repetition(new Terminal([1595]), 0, 1),
	new Terminal(dataset.list[listID.preposition])
]);
const LOCATION = NP;
const SUBJECT  = NP;
const OBJECT   = NP;


const VERB = new Select([
	new Sequence([
		new Tenser(new Terminal(dataset.list[listID.verb]), [Tense.NONE]),
		new Repetition(OBJECT, 0, 1)
	]),
	new Terminal(dataset.list[listID.verb])
]);
const GER  = new Tenser(new Terminal(dataset.list[listID.verb]), [Tense.PRESENT]);



const target = t;
for (let i=0; i<10; i++) {
	const i = Math.floor(Math.random()*target.length);

	console.log([...target.get(i, false, Tense.NONE)].join(" "))
}




// const csv = questions
// 	.map(x => `"${x.text}","${x.sequence.join(",")}"`)
// 	.join("\n") || "";
// Deno.writeTextFileSync(`./concept/grammar.csv`, csv);