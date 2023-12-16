import { readFileSync, writeFileSync, existsSync } from "fs";
import { Collection } from "discord.js";
import { setReadonly } from "./util.js";
import assert from "assert";

export default class TGuild {
	static PATH = "tguilds.json";

	/**
	 * Note: the `this` keyword used within `static` functions refers to the class itself, not any instances.
	 */

	/**
	 * @returns {Collection<string, TGuild>}
	 */
	static load() {
		if (!existsSync(this.PATH)) {
			return new Collection();
		}

		let tguilds;

		try {
			tguilds = JSON.parse(readFileSync(path, "utf8"));
		} catch (err) {
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
	static save(tguilds) {
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
		assert(typeof o.logging === "object");
		assert(typeof o.logging.enabled === "boolean");
		assert(o.logging.channel === null || typeof o.logging.channel === "string");
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

		/** @type {{ enabled: boolean, channel: string? }} */
		this.logging = { enabled: false, channel: null };
	}
}
