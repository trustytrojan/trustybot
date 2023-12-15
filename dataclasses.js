import { readFileSync, writeFileSync } from "fs";
import { Collection } from "discord.js";
import assert from "assert";

/**
 * @param {string} path 
 */
const readJsonFile = (path) => JSON.parse(readFileSync(path).toString());

/**
 * @param {string} key 
 */
const setReadonly = (o, key) => Object.defineProperty(o, key, { writable: false });

export class TGuild {
	static PATH = "tguilds.json";

	/**
	 * @returns {Collection<string, TGuild>}
	 */
	static load() {
		if (!existsSync(this.PATH)) {
			return new Collection();
		}

		/** @type {TGuild[]} */
		let tguilds;

		try {
			tguilds = readJsonFile(this.PATH);
		} catch (err) {
			return new Collection();
		}

		assert(tguilds instanceof Array);
		return new Collection(tguilds.map(tg => [tg.guild, tg]));
	}

	/**
	 * @param {Collection<string, TGuild>} tguilds 
	 */
	static save(tguilds) {
		writeFileSync(this.PATH, JSON.stringify(tguilds));
	}

	/**
	 * @param {string} guild guild id
	 */
	constructor(guild) {
		this.guild = guild; setReadonly(this, "guild");
		this.color = "ff00ff";
	}
}

export class UserProfile {
	static PATH = "profiles.json";

	/**
	 * @returns {Collection<string, UserProfile>}
	 */
	static load() {
		if (!existsSync(this.PATH)) {
			return new Collection();
		}

		/** @type {UserProfile[]} */
		let profiles;

		try {
			profiles = JSON.parse(readFileSync(this.PATH).toString());
		} catch (err) {
			return new Collection();
		}

		assert(profiles instanceof Array);
		return new Collection(profiles.map(profile => [profile.user, profile]));
	}

	/**
	 * 
	 * @param {Collection<string, UserProfile>} profiles 
	 */
	static save(profiles) {
		writeFileSync(this.PATH, JSON.stringify(profiles));
	}

	/**
	 * @param {string} user user id
	 */
	constructor(user) {
		this.user = user;
		this.color = "ff00ff";
		this.description = "*Empty description*";
	}
}

Object.freeze(TGuild);
Object.freeze(UserProfile);
