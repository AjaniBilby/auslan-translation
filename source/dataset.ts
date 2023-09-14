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