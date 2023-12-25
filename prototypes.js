import { CommandInteraction, TextChannel } from "discord.js";

/**
 * @param {string | import("discord.js").InteractionReplyOptions} x 
 */
CommandInteraction.prototype.replyEphemeral = function(x) {
	/** @type {import("discord.js").InteractionReplyOptions} */
	let obj = {};
	if (typeof x === "string")
		obj.content = x;
	if (typeof x === "object")
		obj = x;
	obj.ephemeral = true;
	return this.reply(obj);
};

/**
 * @param {string | import("discord.js").MessageCreateOptions} message 
 */
TextChannel.prototype.trySend = async function(message) {
	try { return await this.send(message); } catch {}
};
