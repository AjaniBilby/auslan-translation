function Bell_Curve(x: number, sigma: number, mu: number): number {
	return 1
		/ (sigma * Math.sqrt(2*Math.PI))
		* Math.pow(
			Math.E,
			-0.5*Math.pow((x-mu)/sigma, 2)
		)
}



const mu = 1.5;
const minSigma = 0.1;
const maxSigma = 0.4;


const data = [];
for (let x=0; x<100; x++) {
	const row = [x];
	const sigma = x/100 * (maxSigma-minSigma) + minSigma;

	for (let y=0; y<100; y++) {
		const p = y/100*1.5;
		row.push(Bell_Curve(p, sigma, mu));
	}

	data.push(row.join(','));
}

Deno.writeTextFileSync('fake.csv', data.join('\n'));