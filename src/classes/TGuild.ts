import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { Collection, EmbedBuilder } from 'discord.js';
import { TbChatInputCommandInteraction } from './Trustybot.js';

export type TGuildData = {
	embedColor: string;
	logChannel: string | undefined;
};

export type ServerSettingsSetter = (
	value: string,
	interaction: TbChatInputCommandInteraction,
	embed: EmbedBuilder,
) => string;

export default class TGuild {
	private static readonly PATH = 'tguilds.json';
	embedColor: string;
	logChannel: string | null;

	public static loadTGuilds(): Collection<string, TGuild> {
		if (!existsSync(this.PATH)) {
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

		return new Collection(
			Object.entries(tguilds).map(([k, v]) => [k, new TGuild(v)]),
		);
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
