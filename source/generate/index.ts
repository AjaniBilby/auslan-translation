/// <reference lib="deno.ns" />

import { resolve, join, relative } from "https://deno.land/std@0.201.0/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.201.0/fs/mod.ts";
import * as colors from "https://deno.land/std@0.201.0/fmt/colors.ts";

import { Panic } from "../helper.ts";

if (Deno.args.includes("--version")) {
	console.log("version: 0.0.0");
	Deno.exit(0);
}

if (!Deno.args[0]) {
	Yeet(`${colors.red("Error")}: Please provide an entry file`);
}

const cwd = resolve("./");
const root = join(cwd, Deno.args[0]);