import { readFileSync, writeFileSync, existsSync } from "fs";
import { Collection } from "discord.js";
import { ssGetTextChannelFromMention } from "./util.js";

/**
 * @typedef {object} TgCounting
 * @prop {string?} channel
 * @prop {readonly string} channelString
 * @prop {number} count
 * @prop {string?} lastUser
 */

/**
 * @typedef {object} TGuildData
 * @prop {string} embedColor
 * @prop {string?} logChannel
 * @prop {string?} bumpChannel
 * @prop {TgCounting} counting
 */

const defaultTgCounting = () => ({ channel: null, count: 1, lastUser: null });

export default class TGuild {
	static PATH = "tguilds.json";

	/**
	 * @returns {Collection<string, TGuild>}
	 */
	static loadTGuilds() {
		if (!existsSync(this.PATH)) {
			return new Collection;
		}

		/** @type {{ [_: string]: TGuildData }} */
		let tguilds;
		try { tguilds = JSON.parse(readFileSync(this.PATH, "utf8")) }
		catch (err) {
			if (err instanceof SyntaxError)
				return new Collection;
			throw err;
		}

		/* imperative:
		const entries = Object.entries(tguilds);
		for (let i = 0; i < entries.length; ++i)
			entries[i][1] = new TGuild(entries[i][1]);
		return new Collection(entries); */

		// functional:
		return new Collection(Object.entries(tguilds).map(([k, v]) => [k, new TGuild(v)]));
	}

	/**
	 * @param {Collection<string, TGuild>} tguilds 
	 */
	static saveTGuilds(tguilds) {
		const data = {};
		for (const [k, v] of tguilds) data[k] = v;
		writeFileSync(this.PATH, JSON.stringify(data, null, "\t"));
	}

	/** @param {TGuildData | undefined} o */
	constructor(o = {}) {
		this.embedColor = o.embedColor ?? "ff00ff";
		this.logChannel = o.logChannel ?? null;
		this.bumpChannel = o.bumpChannel ?? null;
		this.counting = o.counting ?? {
			channel: null,
			count: 0,
			lastUser: null
		};

		Object.defineProperty(this.counting, "channelString", {
			get: () => this.channel ? `<#${this.channel}>` : "(not set)",
		});
	}

	get logChannelString() {
		return this.logChannel ? `<#${this.logChannel}>` : "(not set)";
	}

	get bumpChannelString() {
		return this.bumpChannel ? `<#${this.bumpChannel}>` : "(not set)";
	}

	/* The following methods are designed to be called by the code of the `/server_settings` command. */

	/** @type {ServerSettingsOptionCheck} */
	embed_color(value, _, embed) {
		try { embed.setColor(value) }
		catch { return `**error:** \`${value}\` is not a hex color code` }
		return `\`${this.embedColor}\` ➡️ \`${this.embedColor = value}\``;
	}

	/** @type {ServerSettingsOptionCheck} */
	log_channel(value, { guild }) {
		return this.#ssTextChannel("log", value, guild, "server logs will be sent here!");
	}

	/** @type {ServerSettingsOptionCheck} */
	bump_channel(value, { guild }) {
		return this.#ssTextChannel("bump", value, guild, "bump reminders will be sent here!");
	}

	/** @type {ServerSettingsOptionCheck} */
	async counting_channel(value, { guild }) {
		if (value === "clear") {
			const str = this.counting.channelString;
			this.counting = defaultTgCounting();
			return `${str} ➡️ (not set)`;
		}
		const channel = await ssGetTextChannelFromMention(value, guild);
		if (typeof channel === "string")
			return channel;
		const myPermissions = channel.permissionsFor(guild.members.me);
		if (!channel.viewable && !myPermissions.has("AddReactions"))
			return `**error:** i need \`View Channel\` and \`Add Reactions\` perms on ${value}`;
		return `${this.counting.channelString} ➡️ <#${this.counting.channel = channel.id}>`;
	}

	/**
	 * @param {"log" | "bump"} channelType
	 * @param {string} value The value of the interaction option
	 * @param {import("discord.js").Guild} guild 
	 * @returns a field value used in the "Changing server settings" embed
	 */
	async #ssTextChannel(channelType, value, guild, message) {
		const channelKey = channelType + "Channel";
		const channelStringKey = channelType + "ChannelString";
		if (value === "clear") {
			const str = this[channelStringKey];
			this[channelKey] = null;
			return `${str} ➡️ (not set)`;
		}
		const channel = await ssGetTextChannelFromMention(value, guild);
		if (typeof channel === "string") return channel;
		if (!await channel.trySend(message)) return `**error:** i cannot send messages in ${value}`;
		return `${this[channelStringKey]} ➡️ <#${this[channelKey] = channel.id}>`;
	}
}
