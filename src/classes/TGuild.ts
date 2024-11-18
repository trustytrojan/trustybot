import { Collection } from 'discord.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export type TGuildData = {
	embedColor: string;
	logChannel: string | undefined;
};

export default class TGuild {
	private static readonly PATH = `${process.cwd()}/data/tguilds.json`;
	embedColor: string;
	logChannel: string | null;

	public static loadTGuilds(): Collection<string, TGuild> {
		if (!existsSync(this.PATH)) {
			if (!existsSync(`${process.cwd()}/data`)) {
				mkdirSync(`${process.cwd()}/data`);
			}
			return new Collection();
		}

		let tguilds: { [_: string]: TGuildData };
		try {
			tguilds = JSON.parse(readFileSync(this.PATH).toString());
		} catch (err) {
			if (err instanceof SyntaxError) {
				return new Collection();
			}
			throw err;
		}

		return new Collection(Object.entries(tguilds).map(([k, v]) => [k, new TGuild(v)]));
	}

	static saveTGuilds(tguilds: Collection<string, TGuild>) {
		const data: { [_: string]: TGuild } = {};
		for (const [k, v] of tguilds) data[k] = v;
		writeFileSync(this.PATH, JSON.stringify(data, null, '\t'));
	}

	constructor(o: TGuildData = {} as TGuildData) {
		this.embedColor = o.embedColor ?? 'ff00ff';
		this.logChannel = o.logChannel ?? null;
	}

	get logChannelString() {
		return this.logChannel ? `<#${this.logChannel}>` : '(not set)';
	}
}
