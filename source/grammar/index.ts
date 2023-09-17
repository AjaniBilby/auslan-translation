/// <reference lib="deno.ns" />

import * as colors from "https://deno.land/std@0.201.0/fmt/colors.ts";

import * as Parser from "../bnf/syntax.js";
import { Terminal } from "./terminal.ts";
import { Sequence } from "./sequence.ts";
import { Select } from "./select.ts";
import { Repetition } from "./repetition.ts";
await Parser.ready;

const adj  = new Terminal([1435, 234, 461, 725, 1800]);
const adv  = new Terminal([595, 634, 461]);
const noun = new Terminal([371, 416, 520]);

const seq = new Sequence([noun, noun]);
const sel = new Select([adv, noun]);

const rep = new Repetition(noun, 0, 2);


for (let i=0; i<rep.length; i++) {
	console.log("index", i);
	console.log([...rep.get(i, false)])
}




// const csv = questions
// 	.map(x => `"${x.text}","${x.sequence.join(",")}"`)
// 	.join("\n") || "";
// Deno.writeTextFileSync(`./concept/grammar.csv`, csv);