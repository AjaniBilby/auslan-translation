/// <reference lib="deno.ns" />

import { existsSync } from "https://deno.land/std@0.201.0/fs/mod.ts";
import * as colors from "https://deno.land/std@0.201.0/fmt/colors.ts";

import { Panic } from "../helper.ts";
import { Scope } from "./generator.ts";

import * as Parser from "../bnf/syntax.js";
await Parser.ready;

if (Deno.args.includes("--version")) {
	console.log("version: 0.0.0");
	Deno.exit(0);
}

const target = Deno.args[0];
if (!target) Panic(`${colors.red("Error")}: Please provide an entry file`);

const targetPath = `./concept/${target}`;
if (!existsSync(targetPath)) Panic(`${colors.red("Error")}: Unable to find file`);
const program = Deno.readTextFileSync(targetPath);

const scope = new Scope();
scope.compute(program);