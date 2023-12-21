import secrets from "./secrets.json" assert { type: "json" };
import { MongoClient } from "mongodb";

const defaultTGuild = {
	embedColor: "ff00ff",
	logChannel: null
};

class TGuildWrapper {
	constructor(_id) {
		this._id = _id;
	}

	/**
	 * WHAT TO DO WITH TGUILD CLASS NOW THAT MONGODB WORKS?
	 * 
	 * DECIDE PLEASE
	 */

	get embedColor() {
		return TGuildDb.get(this._id).then(o => o.embedColor);
	}

	set embedColor(val) {
		TGuildDb.set(this._id, { embedColor: val });
	}

	get logChannel() {
		return TGuildDb.get(this._id).then(o => o.logChannel);
	}
}

export default class TGuildDb {
	static async init() {
		this.client = await MongoClient.connect(`mongodb+srv://t:${secrets.mongodb}@cluster0.11u8ijc.mongodb.net/?retryWrites=true&w=majority`);
		this.coll = this.client.db("tguilds").collection("tguilds");
	}

	/**
	 * @param {string} _id guild id
	 * @returns {Promise<import("mongodb").WithId<import("mongodb").Document>>}
	 */
	static ensure(_id) {
		return this.coll.findOneAndUpdate({ _id }, { $setOnInsert: { _id, ...defaultTGuild } }, { upsert: true, returnDocument: "after" });
	}

	/**
	 * @param {string} _id guild id
	 */
	static get(_id) {
		return this.coll.findOne({ _id });
	}

	static set(_id, $set) {
		return this.coll.updateOne({ _id }, { $set });
	}
}