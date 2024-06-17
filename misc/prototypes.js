import { CommandInteraction, TextChannel, Guild, AuditLogEvent } from 'discord.js';
import { doNothing } from './util.js';

/**
 * @param {string | import('discord.js').InteractionReplyOptions} x 
 */
CommandInteraction.prototype.replyEphemeral = function (x) {
	if (typeof x === 'string')
		return this.reply(x);
	if (typeof x === 'object')
		return this.reply({ ...x, ephemeral: true });
	throw new TypeError(`invalid type: ${typeof x}`);
};

/**
 * @param {string | import('discord.js').MessageCreateOptions} message 
 */
TextChannel.prototype.trySend = function (message) {
	return this.send(message).catch(doNothing);
};

/**
 * Returns the latest audit log entry, or `undefined` if it isn't of one of `types`.
 * @param {(keyof typeof import('discord.js').AuditLogEvent)[]} types 
 */
Guild.prototype.fetchLatestAuditLogEntry = async function (types) {
	const entry = (await this.fetchAuditLogs({ limit: 1 })).entries.first();
	if (!entry)
		return;
	if (!types.map(t => AuditLogEvent[t]).includes(entry.action))
		return;
	return entry;
};
