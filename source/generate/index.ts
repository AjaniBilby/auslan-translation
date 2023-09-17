/// <reference lib="deno.ns" />

import { existsSync } from "https://deno.land/std@0.201.0/fs/mod.ts";
import * as colors from "https://deno.land/std@0.201.0/fmt/colors.ts";

import { Panic } from "../helper.ts";
import { Scope } from "./generator.ts";

import * as Parser from "../bnf/syntax.js";
await Parser.ready;

const target = Deno.args[0];
if (!target) Panic(`${colors.red("Error")}: Please provide an entry file`);

const targetPath = `./concept/${target}.txt`;
if (!existsSync(targetPath)) Panic(`${colors.red("Error")}: Unable to find file`);
const program = Deno.readTextFileSync(targetPath);

const scope = new Scope();
const { questions } = await scope.compute(program);

const csv = questions
	.map(x => `"${x.text}","${x.sequence.join(",")}"`)
	.join("\n") || "";
Deno.writeTextFileSync(`./concept/${target}.csv`, csv);