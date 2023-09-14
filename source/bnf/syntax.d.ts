import type * as _Shared from './shared.js';
export type _Literal = { type: "literal", value: string, start: number, end: number, count: number, ref: _Shared.ReferenceRange };
export type Term_Program = {
	type: 'program',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		{ type: '(...)+', value: [Term_Statement] & Array<Term_Statement>, start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_Program (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Program,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Statement = {
	type: 'statement',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(Term_Assign | Term_Block | Term_Vocab)
	]
}
export declare function Parse_Statement (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Statement,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_W = {
	type: 'w',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal & {value: "\x20"} | _Literal & {value: "\x09"} | Term_Nl | Term_Comment)
	]
}
export declare function Parse_W (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_W,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Nl = {
	type: 'nl',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal & {value: "\x0d\x0a"} | _Literal & {value: "\x0a"})
	]
}
export declare function Parse_Nl (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Nl,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Ws = {
	type: 'ws',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal & {value: "\x20"} | _Literal & {value: "\x09"})
	]
}
export declare function Parse_Ws (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Ws,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Comment = {
	type: 'comment',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(Term_Comment_single | Term_Comment_multi)
	]
}
export declare function Parse_Comment (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Comment,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Comment_single = {
	type: 'comment_single',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal & {value: "\x2f\x2f"},
		_Literal,
		{ type: '(...)?', value: [] | [Term_Nl], start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_Comment_single (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Comment_single,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Comment_multi = {
	type: 'comment_multi',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal & {value: "\x2f\x2a"},
		_Literal,
		_Literal & {value: "\x2a\x2f"}
	]
}
export declare function Parse_Comment_multi (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Comment_multi,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Name = {
	type: 'name',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal & {value: "\x5f"} | Term_Letter),
		{ type: '(...)*', value: Array<(Term_Letter | Term_Digit | _Literal & {value: "\x5f"})>, start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_Name (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Name,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Letter = {
	type: 'letter',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal | _Literal)
	]
}
export declare function Parse_Letter (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Letter,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Digit = {
	type: 'digit',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal
	]
}
export declare function Parse_Digit (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Digit,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Digit_nz = {
	type: 'digit_nz',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal
	]
}
export declare function Parse_Digit_nz (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Digit_nz,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Keyword = {
	type: 'keyword',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal & {value: "minimal"}
	]
}
export declare function Parse_Keyword (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Keyword,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Integer = {
	type: 'integer',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal & {value: "0"} | {
	type: '(...)',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		Term_Digit_nz,
		{ type: '(...)*', value: Array<Term_Digit>, start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
})
	]
}
export declare function Parse_Integer (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Integer,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Tense = {
	type: 'tense',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal & {value: "past"} | _Literal & {value: "present"} | _Literal & {value: "future"})
	]
}
export declare function Parse_Tense (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Tense,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Vocab = {
	type: 'vocab',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal
	]
}
export declare function Parse_Vocab (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Vocab,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Expr = {
	type: 'expr',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		Term_Operand,
		{ type: '(...)*', value: Array<{
	type: '(...)',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal,
		Term_Operand
	]
}>, start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_Expr (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Expr,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Operator = {
	type: 'operator',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal & {value: "\x26"} | _Literal & {value: "\x7c"} | _Literal & {value: "\x2d"})
	]
}
export declare function Parse_Operator (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Operator,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Operand = {
	type: 'operand',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal | Term_Brackets),
		{ type: '(...)?', value: [] | [Term_Selector], start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_Operand (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Operand,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Brackets = {
	type: 'brackets',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		Term_Expr
	]
}
export declare function Parse_Brackets (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Brackets,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Selector = {
	type: 'selector',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal & {value: "id"} | _Literal & {value: "pick"} | _Literal & {value: "\x21pick"}),
		_Literal
	]
}
export declare function Parse_Selector (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Selector,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Capture = {
	type: 'capture',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal & {value: "\x24"},
		_Literal
	]
}
export declare function Parse_Capture (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Capture,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Assign = {
	type: 'assign',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal,
		Term_Expr
	]
}
export declare function Parse_Assign (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Assign,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Block = {
	type: 'block',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal,
		{ type: '(...)*', value: Array<Term_Stmt>, start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_Block (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Block,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Stmt = {
	type: 'stmt',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal,
		Term_Stmt_value
	]
}
export declare function Parse_Stmt (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Stmt,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Stmt_value = {
	type: 'stmt_value',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(Term_String | Term_List | _Literal | Term_Expr | _Literal)
	]
}
export declare function Parse_Stmt_value (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Stmt_value,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_String = {
	type: 'string',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		{ type: '(...)+', value: [(_Literal | Term_Str_embed)] & Array<(_Literal | Term_Str_embed)>, start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_String (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_String,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Str_embed = {
	type: 'str_embed',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal,
		Term_Expr,
		_Literal
	]
}
export declare function Parse_Str_embed (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Str_embed,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_List = {
	type: 'list',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		Term_Expr,
		{ type: '(...)+', value: [{
	type: '(...)',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		Term_Expr
	]
}] & Array<{
	type: '(...)',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		Term_Expr
	]
}>, start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_List (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_List,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}
