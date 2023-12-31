export type SignID = number;

export type Sign = {
	tokenID:       number,
	id:            SignID,
	title:         string,
	isAdjective:   boolean,
	isVerb:        boolean,
	isAdverb:      boolean,
	isNoun:        boolean,
	isQuantifier:  boolean,
	isPreposition: boolean,
	tensePast:     string,
	tenseCurrent:  string,
	tenseFuture:   string,
	keywords:      string[]
};

export const dataset: {
	vocab: {
		id: number,
		name: string
	},
	sign: Array<Sign>,
	category: {
		[key: string]: number
	},
	list: {
		[key: string]: SignID[]
	},
} = JSON.parse(Deno.readTextFileSync("./data/signs.json"));


for (const key in dataset.list) {
	dataset.list[key] = dataset.list[key].filter(x => dataset.sign.some(s => s.id === x));
}


export const signMap = new Map<SignID, Sign>();
for (const sign of dataset.sign) {
	signMap.set(sign.id, sign);
}