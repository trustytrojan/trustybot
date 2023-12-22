import { Collection } from "discord.js";
import { MongoClient } from "mongodb";

const defaultTGuild = {
	embedColor: "ff00ff",
	logChannel: null
};

/**
 * @typedef {object} TGuildDocument
 * @prop {string} _id
 * @prop {string} embedColor
 * @prop {string?} logChannel
 */

class TGuildWrapper {
	/** @param {TGuildDocument} doc */
	constructor(doc) {
		this._id = doc._id;
		this.embedColor = doc.embedColor;
		this.logChannel = doc.logChannel;
	}

	/** @param {string} embedColor */
	setEmbedColor(embedColor) {
		this.embedColor = embedColor;
		return TGuildDb.update(this._id, { embedColor });
	}

	/** @param {string?} logChannel */
	setLogChannel(logChannel) {
		this.logChannel = logChannel;
		return TGuildDb.update(this._id, { logChannel });
	}
}

export default class TGuildDb {
	static async init() {
		const { mongodb } = await import("./secrets.json", { with: { type: "json" } });
		this.client = await MongoClient.connect(`mongodb+srv://t:${mongodb}@cluster0.11u8ijc.mongodb.net/?retryWrites=true&w=majority`);
		this.coll = this.client.db("tguilds").collection("tguilds");
		this.cache = new Collection((await this.coll.find().toArray()).map(o => [o._id, o]));
	}

	static close() {
		return this.client.close();
	}

	/**
	 * @param {string} _id guild id
	 */
	static async ensure(_id) {
		const doc = await this.coll.findOneAndUpdate({ _id }, { $setOnInsert: { _id, ...defaultTGuild } }, { upsert: true, returnDocument: "after" });
		return new TGuildWrapper(doc);
	}

	/**
	 * @param {string} _id guild id
	 */
	static async find(_id) {
		const doc = await this.coll.findOne({ _id });
		if (!doc) return null;
		return new TGuildWrapper(doc);
	}

	/**
	 * @param {string} _id guild id
	 * @param {*} $set object with entries to modify
	 */
	static update(_id, $set) {
		const tg = this.cache.get(_id);
		for (const k in $set)
			{} 
		return this.coll.updateOne({ _id }, { $set });
	}
}