import { Tense, Terminal } from "./terminal.ts";
import { Repetition } from "./repetition.ts";
import { Transform } from "./transform.ts";
import { Sequence } from "./sequence.ts";
import { dataset } from "../../dataset.ts";
import { Select } from "./select.ts";
import { Tenser } from "./tenser.ts";

const listID = {
	adjective: 177,
	adverb: 178,
	noun: 179,
	preposition: 181,
	verb: 177,
	questionSigns: 86,
}

export const WHEN  = new Terminal(dataset.list[listID.questionSigns]);
export const IF    = new Terminal([1920, 322, 1777,]);
export const AND   = new Terminal(["and", "but", "or"]);

export const ADJ  = new Terminal(dataset.list[listID.adjective]);
export const ADV  = new Terminal(dataset.list[listID.adverb]);
export const NOUN = new Terminal(dataset.list[listID.noun]);
export const NP = new Transform([
	new Terminal(["a", "an", "the"]),
	NOUN,
	new Repetition(ADJ, 1, 1),
], [0, 2, 1]);
export const PREP = new Sequence([
	new Repetition(new Terminal([1595]), 0, 1),
	new Terminal(dataset.list[listID.preposition])
]);
export const LOCATION = NP;
export const SUBJECT  = NP;
export const OBJECT   = NP;


export const VERB = new Select([
	new Transform([
		new Repetition(OBJECT, 0, 1),
		new Tenser(new Terminal(dataset.list[listID.verb]), [Tense.NONE]),
	], [1, 0]),
	new Terminal(dataset.list[listID.verb])
]);
export const GER  = new Tenser(new Terminal(dataset.list[listID.verb]), [Tense.PRESENT]);


export const FOGHORN = new Sequence([
	new Repetition(PREP, 0, 1),
	new Repetition(NP, 0, 1),
	OBJECT,
]);
export const GERUND = new Select([FOGHORN, GER]);

export const ADJECTIVE = new Select([
	GERUND,
	new Sequence([PREP, NP]),
	ADJ,
]);

export const STATEMENT = new Transform([
	SUBJECT,
	new Repetition(ADJ, 0, 2),    // ADJ+
	new Repetition(new Select([  // STATEMENT-LESS ADVERB+
		ADV,
		GERUND,
		new Sequence([PREP, NP]),
	]), 0, 2),
	new Repetition(ADJECTIVE, 1, 3),
	new Repetition(VERB, 0, 2),
], [1, 2, 0, 3, 4]);

export const ADVERB = new Select([
	ADV,
	new Sequence([WHEN, STATEMENT]),
	new Sequence([IF, STATEMENT]),
	GERUND,
	new Sequence([PREP, NP]),
]);

export const CLAUSE = new Transform([
	SUBJECT,
	new Repetition(ADJECTIVE, 0, 2),
	new Repetition(ADVERB, 0, 2),
	VERB,
], [1, 2, 0, 3]);


export const COMMAND = new Transform([
	VERB,
	new Repetition(ADJ, 1, 1),
	new Repetition(ADVERB, 1, 1),
], [1, 2, 0]);
export const QUESTION = new Transform([
	SUBJECT,
	new Repetition(ADJ, 0, 1),
	new Repetition(ADVERB, 1, 1),
	new Terminal(["DO"]),
	new Repetition(ADJECTIVE, 1, 1),
	new Repetition(VERB, 0, 2),
	new Repetition(new Terminal(dataset.list[listID.questionSigns]), 0, 1),
], [6, 1, 2, 3, 0, 4, 5]);

export const SENTENCE = new Select([STATEMENT, COMMAND, QUESTION, CLAUSE]);