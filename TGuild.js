import { readFileSync, writeFileSync, existsSync } from "fs";
import { Collection, TextChannel, resolveColor } from "discord.js";
import { setReadonly } from "./util.js";
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

	/**
	 * @param {string} value 
	 * @param {TbChatInputCommandInteraction} 
	 * @returns a field value used in the "Changing server settings" embed
	 */
	async log_channel(value, { guild }) {
		if (value === "clear") {
			const str = this.logChannelString;
			this.logChannel = null;
			return `${str} ➡️ (not set)`;
		}

		const id = value.replace("<", "").replace("#", "").replace(">", "");

		let channel;
		try {
			channel = await guild.channels.fetch(id);
		} catch (err) {
			return `**error:** \`${value}\` is not a channel mention`;
		}

		if (!(channel instanceof TextChannel)) {
			return `**error:** channel ${value} is not a text channel`;
		}

		try {
			await channel.send("server logs will be sent here!");
			return `${this.logChannelString} ➡️ <#${this.logChannel = id}>`;
		} catch (err) {
			return `**error:** i cannot send messages in ${value}`;
		}
	}
}
