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
function GreyScale(p: number) {
	const b = p*255;
	return new Uint8Array([b, b, b, 255]);
}

for (let i=0; i<regions; i++) {
	// Grey scale
	// colKey.push(GreyScale(1.0 - Math.abs(i/regions - 0.5) * 2.0));

	// Hue based
	colKey.push(Hsl2Rgb(i/regions * 360 + 180));
}




const canvas = createCanvas(3000, 1000);
const ctx = canvas.getContext("2d");

const buffer    = ctx.getImageData(0, 0, 3000, 1000);
const colWidth  = buffer.width / (data.length-1);

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
		if (next > local_y) return Colorize( past_index-1, i-1, p, out );

		past_index = i;
		past = next;
	}

	return Transparent(out);
}

for (let y=0; y<buffer.height; y++) {
	for (let x=0; x<buffer.width; x++) {
		Kernel(
			x,                       // x-coordinate
			buffer.height-y,         // y-coordinate invert
			(x + y*buffer.width) * 4 // output ptr
		);
	}
}

ctx.putImageData(buffer, 0,0);




ctx.globalAlpha = 0.2;
ctx.lineWidth = 1;
ctx.strokeStyle = "black";
ctx.lineCap = "round";
for (let col=1; col<data[0].length; col++) {
	ctx.beginPath();
	ctx.moveTo(
		0,
		buffer.height - data[0][col]/max*buffer.height,
	);
	for (let i=1; i<data.length; i++) {
		ctx.lineTo(
			i*colWidth,
			buffer.height - data[i][col]/max*buffer.height,
		);
	}
	ctx.stroke();
}
ctx.globalAlpha = 1.0;

await Deno.writeFile(args.output, canvas.toBuffer());