import { createCanvas } from "https://deno.land/x/canvas/mod.ts";
import { parse } from "https://deno.land/std@0.203.0/flags/mod.ts";

const args = parse(Deno.args);
console.dir(args);

if (!args._[0]) {
	console.error(`Missing csv input`);
	Deno.exit(1)
}

if (!args.output) {
	console.error(`Missing output argument`);
	Deno.exit(1)
}


const data = Deno.readTextFileSync(args._[0].toString())
	.split('\n')
	.map(row => row.split(',').map(x => Number(x)));

if (data[data.length-1].length <= 1) {
	data.splice(data.length-1, 1);
}





const regions = data[0].length-1;
let max = 0;
for (const row of data) {
	if (row.length-1 != regions) throw new Error(`Malformed data, row ${row[0]} is not ${regions} long like the rest`);
	for (let i=1; i<row.length; i++) if (row[i] > max) max = row[i];
}






// Pre-compute column colors
const colKey = [] as Array<Uint8Array>;
function Hsl2Rgb(h: number) {
	h = h % 360;   // Ensure h is [0, 360)
	h /= 60.0;     // Scale it to [0, 6)
	const c = 255; // Since S and L are always 100%, c is always 255

	const x = Math.round(c * (1 - Math.abs(h % 2 - 1))); // Intermediate value

	if (h < 1) {
		return new Uint8Array([c, x, 0, 255]);
	} else if (h < 2) {
		return new Uint8Array([x, c, 0, 255]);
	} else if (h < 3) {
		return new Uint8Array([0, c, x, 255]);
	} else if (h < 4) {
		return new Uint8Array([0, x, c, 255]);
	} else if (h < 5) {
		return new Uint8Array([x, 0, c, 255]);
	} else {
		return new Uint8Array([c, 0, x, 255]);
	}
}
for (let i=0; i<regions; i++) {
	colKey.push(Hsl2Rgb(i/regions * 360 + 180));
}




const canvas = createCanvas(3000, 1000);
const ctx = canvas.getContext("2d");

const buffer    = ctx.getImageData(0, 0, 3000, 1000);
const colWidth  = buffer.width / (data.length-1);
const pixelSize = 4;
const lineThreshold = 1.5/buffer.height*max;

function Colorize(colA: number, colB: number, p: number, out: number) {
	const a = colKey[colA];
	const b = colKey[colB];
	const q = 1 - p;

	buffer.data[out+0] = a[0]*p + b[0]*q;
	buffer.data[out+1] = a[1]*p + b[1]*q;
	buffer.data[out+2] = a[2]*p + b[2]*q;
	buffer.data[out+3] = a[3]*p + b[3]*q;
}
function Transparent(out: number) {
	buffer.data[out+0] = 0;
	buffer.data[out+1] = 0;
	buffer.data[out+2] = 0;
	buffer.data[out+3] = 0;
}
function Darken(amount: number, out: number) {
	amount = 1-amount*0.7;
	buffer.data[out+0] *= amount;
	buffer.data[out+1] *= amount;
	buffer.data[out+2] *= amount;
	buffer.data[out+3] = 255;
}

function Kernel(x: number, y: number, out: number) {
	let p_x = x / colWidth;
	const x0 = Math.floor(p_x);
	const x1 = Math.ceil(p_x);
	p_x %= 1;

	const local_y = y / buffer.height * max;

	let past = (data[x1][1] - data[x0][1]) * p_x + data[x0][1];
	let past_index = 1;
	if (past > local_y) return Transparent(out);

	for (let i=2; i<=regions; i++) {
		const next = (data[x1][i] - data[x0][i]) * p_x + data[x0][i];



		const p = (local_y - next) / (past - next);
		if (next > local_y) {
			Colorize( past_index-1, i-1, p, out )
			const lineDelta = Math.abs(next-local_y);
			if (lineDelta <= lineThreshold) Darken(lineDelta/lineThreshold, out);

			return;
		};

		past_index = i;
		past = next;
	}

	return Transparent(out);
}

for (let y=0; y<buffer.height; y++) {
	for (let x=0; x<buffer.width; x++) {
		Kernel(
			x,                               // x-coordinate
			buffer.height-y,                 // y-coordinate invert
			(x + y*buffer.width) * pixelSize // output ptr
		);
	}
}

ctx.putImageData(buffer, 0,0);

await Deno.writeFile(args.output, canvas.toBuffer());