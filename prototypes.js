import { CommandInteraction } from "discord.js";

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
