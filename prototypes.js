import { CommandInteraction, TextChannel } from "discord.js";
import { doNothing } from "./util.js";

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
TextChannel.prototype.trySend = function(message) {
	return this.send(message).catch(doNothing);
};
