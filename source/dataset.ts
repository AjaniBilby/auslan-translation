export type SignID = number;
export type ListID = string;

export const dataset: {
	vocab: {
		id: number,
		name: string
	},
	sign: Array<{
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
	}>,
	category: {
		[key: string]: ListID[]
	},
	list: {
		[key: ListID]: SignID[]
	},
} = JSON.parse(Deno.readTextFileSync("./data/signs.json"));