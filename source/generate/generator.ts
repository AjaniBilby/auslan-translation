// @deno-types="../bnf/shared.d.ts"
import { SyntaxNode, Reference, ReferenceRange, AssertUnreachable } from "../bnf/shared.js";
// @deno-types="../bnf/syntax.d.ts"
import { Term_Assign, Term_Block, Term_Expr, Term_Operand, Term_Program, Term_Statement, Term_Stmt_value, Term_String, Term_Vocab } from "../bnf/syntax.js";

import { ParseError } from "../bnf/shared.js";
import { Parse_Program } from "../bnf/syntax.js";

import { Entropify } from "./entropy.ts";
import { LazySamples } from './lazy.ts';

import { Sign, dataset } from "../dataset.ts";
import { Panic } from "../helper.ts";

export {
	ParseError, Reference, ReferenceRange
}

export class Translation {
	sequence: number[];
	text: string;

	constructor(english: string, tokenSeq: number[]) {
		this.text = english
			.toLowerCase()
			.replace(/-/g, " ")
			.replace(/'/g, "")
			.replace(/[^a-z0-9 ]/g, "")
			.replace(/  /g, " ")
			.trim();
		this.sequence = tokenSeq;
	}

	mergeSigns(state: number[]) {
		return this.sequence.reduce((s, c) => {
			if (!s.includes(c)) s.push(c);
			return s;
		}, state);
	}
}


enum SignTense {
	PAST,
	PRESENT,
	FUTURE,
	NONE
}

export class SignRef {
	sign: Sign;
	tense: SignTense;

	constructor(sign: Sign, tense: SignTense) {
		this.sign = sign;
		this.tense = tense;

		// Override tensing if not present
		switch (this.tense) {
			case SignTense.PAST:    if (!this.sign.tensePast)    this.tense = SignTense.NONE; break;
			case SignTense.PRESENT: if (!this.sign.tenseCurrent) this.tense = SignTense.NONE; break;
			case SignTense.FUTURE:  if (!this.sign.tenseFuture)  this.tense = SignTense.NONE; break;
		}
	}

	toString() {
		switch (this.tense) {
			case SignTense.PAST:    return this.sign.tensePast;
			case SignTense.PRESENT: return this.sign.tenseCurrent;
			case SignTense.FUTURE:  return this.sign.tenseFuture;
		}

		const synonyms = this.sign.keywords;
		if (synonyms.length > 0 && Math.random() > 0.75) {
			const rand = synonyms[Math.floor( Math.random()*synonyms.length )];
			if (rand) return rand;
		}

		return this.sign.title;
	}
}


type PreloadMetaTargets = {
	lists: Set<number>,
	cats : Set<number>,
	signs: Set<number>,
};


export class Scope {
	section: Translation[][];
	questions: Translation[];
	scope: { [key: string]: number[] };

	vocabID: number;
	vocab: string;

	categories: { [key: number]: number };
	lists:      { [key: number]: number[] };
	signs:      { [key: number]: Sign };

	constructor() {
		this.scope = {};

		this.vocabID = -1;
		this.vocab = "";

		this.questions = [];
		this.section = [];

		this.categories = {};
		this.lists = {};
		this.signs = {};
	}

	set (name: string, value: number[], ref: ReferenceRange) {
		if (this.scope[name]) throw new ParseError(
			`Cannot override variable "${name}"`, ref
		);

		this.scope[name] = value;
	}

	setOverride (name: string, value: number[]) {
		this.scope[name] = value;
	}

	unset(name: string) {
		delete this.scope[name];
	}

	clearScoped() {
		for (const name in this.scope) {
			if (name[0] === "_") this.unset(name);
		}
	}

	setVocab(syntax: Term_Program) {
		const stmts = syntax.value[0].value as SyntaxNode[];
		for (const statement of stmts) {
			const action = (statement as SyntaxNode).value[0] as SyntaxNode;
			switch (action.type) {
				case "vocab": this.vocab = (action.value[0] as SyntaxNode ).value as string; break;
			}
		}
	}

	preload(syntax: Term_Program) {
		const targets: PreloadMetaTargets = {
			signs: new Set(),
			lists: new Set(),
			cats : new Set(),
		};
		Scope.findLoadTargets(syntax, targets);
		this.setVocab(syntax);

		if (this.vocab !== "auto" && dataset.vocab.name != this.vocab) Panic(`Loaded vocab ${dataset.vocab.name}, but requires vocab ${this.vocab}`)

		this.scope["prepositions"] = [];
		this.scope["quantifiers"] = [];
		this.scope["adjectives"] = [];
		this.scope["adVerbs"] = [];
		this.scope["nouns"] = [];
		this.scope["verbs"] = [];
		for (const sign of dataset.sign) {
			this.signs[sign.id] = sign;
			if (sign.isPreposition) this.scope["prepositions"].push(sign.id);
			if (sign.isQuantifier)  this.scope["quantifiers"].push(sign.id);
			if (sign.isAdjective)   this.scope["adjectives"].push(sign.id);
			if (sign.isAdverb)      this.scope["adVerbs"].push(sign.id);
			if (sign.isVerb)        this.scope["verbs"].push(sign.id);
			if (sign.isNoun)        this.scope["nouns"].push(sign.id);
		}

		for (const catID of targets.cats) {
			const key = String(catID);
			const res = dataset.category[key];
			if (!res) Panic(`Unknown category id ${key}`);

			this.categories[catID] = res;
		}

		for (const key in dataset.list) {
			this.lists[Number(key)] = dataset.list[key];
		}
	}

	static findLoadTargets(syntax: SyntaxNode, targets: PreloadMetaTargets) {
		if (syntax.type == "operand") {
			const base = syntax as Term_Operand;
			const selector = base.value[1].value[0];

			if (base.value[0].type === "literal" && selector) {
				if (selector.value[0].value === "id") {
					const target = Number(selector.value[1].value) || -1;
					if (base.value[0].value == "category") targets.cats.add(target);
					if (base.value[0].value == "list")     targets.lists.add(target);
					if (base.value[0].value == "sign")     targets.signs.add(target);
				}
			}
		}

		if (Array.isArray(syntax.value)) {
			for (const inner of syntax.value) {
				Scope.findLoadTargets(inner, targets);
			}
		}

		return targets;
	}


	category(syntax: Term_Operand) {
		const selector = syntax.value[1].value[0];
		if (!selector) throw new ParseError(`Category selector`, syntax.ref);

		const type = selector.value[0].value;
		const goal = Number(selector.value[1].value);

		if (type != "id") throw new ParseError(`Invalid category selector ${type}`, selector.ref);
		if (!this.categories[goal]) throw new ParseError(`Internal error, non-preloaded category ${goal}`, selector.ref);
		const listID = this.categories[goal];
		if (!this.lists[listID]) throw new ParseError(`Internal error, non-preloaded list ${listID}`, selector.ref);

		return this.lists[listID] || listID;
	}

	list(syntax: Term_Operand) {
		const selector = syntax.value[1].value[0];
		if (!selector) throw new ParseError(`List selector`, syntax.ref);

		const type = selector.value[0].value;
		const goal = Number(selector.value[1].value);

		if (type != "id") throw new ParseError(`Invalid category selector ${type}`, selector.ref);
		if (this.lists[goal]) throw new ParseError(`Internal error, non-preloaded list ${goal}`, selector.ref);

		return this.lists[goal];
	}

	sign(syntax: Term_Operand) {
		const selector = syntax.value[1].value[0];
		if (!selector) throw new ParseError(`Sign selector`, syntax.ref);

		const type = selector.value[0].value;
		const goal = Number(selector.value[1].value);

		if (type != "id") throw new ParseError(`Invalid category selector ${type}`, selector.ref);

		return [goal];
	}



	operand(syntax: Term_Operand): number[] {
		const selector = syntax.value[1].value[0];
		const target   = syntax.value[0];
		let val;
		if (target?.type === "literal") {
			// special reserved words
			if (target.value == "category") return this.category(syntax);
			if (target.value == "list")     return this.list(syntax);
			if (target.value == "sign")     return this.sign(syntax);

			if (!this.scope[target?.value]) throw new ParseError(`Unknown variable ${target?.value}`, syntax.ref);
			val = [...this.scope[target?.value]];
		} else {
			val = this.expr(target?.value[0]);
		}

		if (selector) {
			const type = selector.value[0].value;
			const goal = Number(selector.value[1].value);
			switch (type) {
				case "id":
					val = val.filter(x => x == goal);
					break;
				case "pick": // fall through
				case "!pick":
					val = val
						.sort(_ => Math.random()-0.5)
						.slice(0, goal);
					if (type[0] === "!" && val.length < goal) throw new ParseError(`Not enough options to pick from`, selector.ref);
					break;
				default: AssertUnreachable(type);
			}
		}

		return val;
	}

	expr(syntax: Term_Expr) {
		let state = this.operand(syntax.value[0]);

		for (const chain of syntax.value[1].value) {
			const other = this.operand(chain.value[1]);
			switch (chain.value[0].value) {
				case "|":
					other.reduce((c, x) => {
						if (!c.includes(x)) c.push(x);
						return c;
					}, state);
					break;
				case "&":
					state = state.filter(x => other.includes(x));
					break;
				case "-":
					state = state.filter(x => !other.includes(x));
					break;
				default: throw new ParseError(`Unknown operator ${chain.value[0].value}`, chain.value[0].ref);
			}
		}

		return state;
	}

	parseString(syntax: Term_String) {
		const frags : (string | SignRef)[][] = [];
		const order : string[] = [];

		for (const frag of syntax.value[0].value) {
			if (frag.type === "literal") {
				frags.push([frag.value]);
			} else if (frag.type === "str_embed") {
				const val = [...this.expr(frag.value[1])]; // clone so the splice won't affect it
				if (val.length < 1) throw new ParseError(`Not enough options to pick from`, frag.value[1].ref);

				const name = frag.value[0].value;
				if (name != "_") this.set(name, val, frag.value[0].ref);

				const modifier = frag.value[2].value as string;
				const opts: SignRef[] = [];
				let tense = SignTense.NONE;
				if (modifier) {
					if (modifier === "past" )    tense = SignTense.PAST;
					if (modifier === "present" ) tense = SignTense.PRESENT;
					if (modifier === "future" )  tense = SignTense.FUTURE;
				}

				for (const signID of val) {
					const sign = this.signs[signID];
					opts.push(new SignRef(sign, tense));
				}
				frags.push(opts);
				order.push(name);
			} else AssertUnreachable(frag);
		}

		return {
			samples: new LazySamples(frags, frags.map((_, i) => i)),
			order
		};
	}

	parseList(syntax: Term_Stmt_value, order: string[]) {
		const inner = syntax.value[0];

		let exprs: Term_Expr[];
		if (inner.type === "list") {
			exprs = (inner.value[1].value)
				.map((x) => x.value[0])
				.reduce((c, x) => {
					c.push(x);
					return c;
				}, [inner.value[0]])
		} else if (inner.type === "expr") {
			exprs = [ inner ];
		} else {
			throw new ParseError(`Expected list`, syntax.ref);
		}

		const list : number[][] = [];
		const names: string[]   = [];
		for (const expr of exprs) {
			const base = expr.value[0].value[0];
			if (base.type !== "literal") throw new ParseError(`Must be a variable`, expr.ref);
			if (expr.value[1].value.length > 0)            throw new ParseError(`Must be a single operand`, expr.ref);

			const res = this.expr(expr);
			if (res.length < 1) throw new ParseError(`Not enough values`, expr.ref);

			if (expr.value[0].value[1].value.length > 0) {
				if (res.length > 1) throw new ParseError(`Selector must resolve to a single value`, expr.ref);
				names.push(names.length.toString());
			} else {
				names.push(base.value);
			}

			// Convert signIDs to tokenIDs
			for (let i=0; i<res.length; i++) {
				res[i] = this.signs[res[i]].tokenID;
			}

			list.push(res);
		}

		let offset = 0;
		const adjusted = names.map((x, i) => {
			if (order.includes(x)) return order[i - offset];

			offset++;
			return x;
		});
		const mapping = names.map(x => adjusted.indexOf(x));

		return new LazySamples(list, mapping);
	}



	runAssign(syntax: Term_Assign) {
		this.setOverride(
			syntax.value[0].value,
			this.expr(syntax.value[1])
		);
	}



	runSequence(block: Term_Block) {
		let text: LazySamples<string | SignRef> | null = null;
		let tokens: LazySamples<number> | null = null;
		let order: string[] = [];
		let depth = Infinity;
		let take = Infinity;

		console.time("Sequence Generation");
		const stmts = block.value[1].value;
		for (const line of stmts) {
			const type = line.value[0].value;
			const val = line.value[1].value[0];

			if (type == "english") {
				if (val.type != "string") throw new ParseError(`Expected string`, val.ref);
				const res = this.parseString(val);
				depth = res.samples.getDepth();
				text  = res.samples;
				order = res.order;
			} else if (type == "sign") {
				tokens = this.parseList(line.value[1], order);
			} else if (type == "take") {
				take = val.value === "minimal"
					? depth
					: Number(val.value);

				if (isNaN(take) || take < 1) throw new ParseError(`Invalid take value`, val.ref);
			} else throw new ParseError(`Unexpected line ${type}`, line.ref);
		}

		if (!text || text.getLength() < 1) throw new ParseError(`Missing english definition`, block.ref);

		if (text.getLength() != tokens?.getLength()) throw new ParseError(
			`Bad permutation generation. English: ${text.getLength()} Signs: ${tokens?.getLength()}`,
			block.ref
		);

		console.timeEnd("Sequence Generation");
		const title = `  Entropifying ${take} of ${text.getLength()}`;
		console.time(title);
		this.section.push(Entropify(text, tokens, take));
		console.timeEnd(title);
		this.clearScoped();
	}

	runBlock(syntax: Term_Block) {
		if (typeof(syntax.value) === "string") throw new ParseError("Internal error", syntax.ref);


		const type = syntax.value[0].value;
		switch (type) {
			case "TextToSign": return this.runSequence(syntax);
			default: throw new ParseError(`Unknown block type "${type}"`, syntax.ref);
		}
	}


	runStatements(syntax: Term_Statement[]) {
		for (const statement of syntax) {
			const action = statement.value[0];
			switch (action.type) {
				case "assign": this.runAssign(action); break;
				case "block": this.runBlock(action); break;
				case "vocab": break;
				default: throw new ParseError(`unreachable`, statement.ref);
			}
		}
	}

	async compute(outline: string) {
		const result = Parse_Program(outline);

		if (result instanceof ParseError) throw result;

		if (result.isPartial) throw new ParseError(
			"Partial: Unexpected syntax at", new ReferenceRange(
				result.root.ref?.end || Reference.blank(),
				result.root.ref?.end.clone() || Reference.blank()
		));

		this.preload(result.root);

		console.time("Generate Tokens");
		this.runStatements(result.root.value[0].value);
		console.timeEnd("Generate Tokens");

		console.time("Interleave Units");
		this.questions = Interleave(this.section);
		console.timeEnd("Interleave Units");
		return {
			questions: this.questions,
			signs: this.questions
				.reduce((s, c) => c.mergeSigns(s), [] as number[])
				.map(x => this.signs[x])
		};
	}
}


function Interleave(sections: Translation[][]): Translation[] {
	const out: Translation[] = [];
	const max = sections.reduce((s, x) => Math.max(s, x.length), 0);
	const inc = sections.map(x => max/x.length);
	const key = [...inc];

	let remaining = sections.length;
	while (remaining > 0) {
		const idx = sections.reduceRight((s, _, i) => key[s] < key[i] ? s : i, 0);

		const item = sections[idx].pop();
		if (item) {
			key[idx] += inc[idx];
			out.push(item);
		} else {
			key[idx] = Infinity;
			remaining--;
		}

		for (let i=0; i<key.length; i++) {
			key[i]--;
		}
	}

	return out.reverse();
}





export async function Compute(outline: string, vocabID: number) {
	const scope = new Scope();
	scope.vocabID = vocabID;

	console.time("End-to-end");
	const out = await scope.compute(outline);
	console.timeEnd("End-to-end");

	return out;
}