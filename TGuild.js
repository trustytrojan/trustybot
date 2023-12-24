import { readFileSync, writeFileSync, existsSync } from "fs";
import { Collection, TextChannel, resolveColor } from "discord.js";
import { extractChannelId, setReadonly } from "./util.js";
import assert from "assert";

export default class TGuild {
	static PATH = "tguilds.json";

	/**
	 * @returns {Collection<string, TGuild>}
	 */
	static loadTGuilds() {
		if (!existsSync(this.PATH)) {
			return new Collection();
		}

		let tguilds;

		try {
			tguilds = JSON.parse(readFileSync(this.PATH, "utf8"));
		} catch (err) {
			assert(err instanceof SyntaxError);
			return new Collection();
		}

		assert(tguilds instanceof Array);
		
		for (let i = 0; i < tguilds.length; ++i) {
			const tg = tguilds[i];
			this.assert(tg);
			setReadonly(tg, "guild");

			// this assignment prepares the array for the Collection constructor
			tguilds[i] = [tg.guild, tg];
		}
		
		return new Collection(tguilds);
	}

	/**
	 * @param {Collection<string, TGuild>} tguilds 
	 */
	static saveTGuilds(tguilds) {
		assert(tguilds instanceof Collection);
		writeFileSync(this.PATH, JSON.stringify(tguilds));
	}

	/**
	 * Asserts whether an object is a TGuild by type.
	 * @param {object} o
	 */
	static assert(o) {
		assert(typeof o === "object");
		assert(typeof o.guild === "string");
		assert(typeof o.embedColor === "string");
		assert(o.logChannel === null || typeof o.logChannel === "string");
	}

	/**
	 * @param {string} guild 
	 */
	constructor(guild) {
		assert(typeof guild === "string");
		setReadonly(this, "guild", guild);

		/** @type {string} */
		this.guild;
		
		this.embedColor = "ff00ff";

		/** @type {string?} */
		this.logChannel = null;

		/** @type {string?} */
		this.bumpChannel = null;

		/** @type {string?} */
		this.countChannel = null;
	}

	get logChannelString() {
		return this.logChannel ? `<#${this.logChannel}>` : "(not set)";
	}

	get bumpChannelString() {
		return this.bumpChannel ? `<#${this.bumpChannel}>` : "(not set)";
	}

	get countChannelString() {
		return this.countChannel ? `<#${this.countChannel}>` : "(not set)";
	}

	/* The following methods are designed to be called by the code of the `/server_settings` command. */

	/**
	 * @param {string} value 
	 * @returns a field value used in the "Changing server settings" embed
	 */
	embed_color(value) {
		try { // Verify that the value is a hex color code
			resolveColor(value);
			return `\`${this.embedColor}\` ➡️ \`${this.embedColor = value}\``;
		} catch (err) {
			return `**error:** \`${value}\` is not a hex color code`;
		}
	}

	/** @type {ServerSettingsOptionCheck} */
	log_channel(value, { guild }) {
		return this.ssTextChannel("log", value, guild, (c) => c.trySend("server logs will be sent here!"), (c) => `i cannot send messages in ${c}`);
	}

	/** @type {ServerSettingsOptionCheck} */
	bump_channel(value, { guild }) {
		return this.ssTextChannel("bump", value, guild, (c) => c.trySend("bump reminders will be sent here!"), (c) => `i cannot send messages in ${c}`);
	}

	/** @type {ServerSettingsOptionCheck} */
	count_channel(value, { guild }) {
		return this.ssTextChannel("count", value, guild, (c) => c.viewable, (c) => `i cannot view ${c}`);
	}

	/**
	 * @param {"log" | "bump" | "count"} channelType
	 * @param {string} value The value of the interaction option
	 * @param {import("discord.js").Guild} guild 
	 * @param {(_: TextChannel) => Promise<boolean>} channelVerifier
	 * @param {(_: TextChannel) => string} failMessage
	 * @returns a field value used in the "Changing server settings" embed
	 */
	async ssTextChannel(channelType, value, guild, channelVerifier, failMessage) {
		if (value === "clear") {
			return this.ssClearChannel(channelType);
		}

		const channelId = extractChannelId(value);
		let channel;

		try {
			channel = await guild.channels.fetch(channelId);
		} catch (err) {
			return `**error:** \`${value}\` is not a channel mention`;
		}

		if (!(channel instanceof TextChannel)) {
			return `**error:** channel ${value} is not a text channel`;
		}

		if (!await channelVerifier(channel)) {
			return `**error:** ${failMessage(channel)}`;
		}

		return `${this[channelType + "ChannelString"]} ➡️ <#${this[channelType + "Channel"] = channelId}>`;
	}

	/**
	 * Sets `this[channelType + "Channel"]` to `null`.
	 * @param {"log" | "bump" | "count"} channelType 
	 * @returns a field value used in the "Changing server settings" embed
	 */
	ssClearChannel(channelType) {
		const str = this[channelType + "ChannelString"];
		this[channelType + "Channel"] = null;
		return `${str} ➡️ (not set)`;
	}
}
