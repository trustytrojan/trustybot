import {
	AuditLogEvent,
	CommandInteraction,
	Guild,
	GuildAuditLogsEntry,
	InteractionReplyOptions,
	InteractionResponse,
} from 'discord.js';

export interface TbCommandInteraction extends CommandInteraction {
	replyEphemeral(
		x: string | InteractionReplyOptions,
	): Promise<InteractionResponse<boolean>>;
}

export interface TbGuild extends Guild {
	fetchLatestAuditLogEntry(
		types: (keyof typeof AuditLogEvent)[],
	): Promise<GuildAuditLogsEntry | undefined>;
}

(CommandInteraction.prototype as TbCommandInteraction).replyEphemeral = function (x: string | InteractionReplyOptions) {
	if (typeof x === 'string') {
		return this.reply(x);
	}
	if (typeof x === 'object') {
		return this.reply({ ...x, ephemeral: true });
	}
	throw new TypeError(`invalid type: ${typeof x}`);
};

/**
 * Returns the latest audit log entry, or `undefined` if it isn't of one of `types`.
 * @param {(keyof typeof import('discord.js').AuditLogEvent)[]} types
 */
(Guild.prototype as TbGuild).fetchLatestAuditLogEntry = async function (
	types: (keyof typeof AuditLogEvent)[],
) {
	const entry = (await this.fetchAuditLogs({ limit: 1 })).entries
		.first();
	if (!entry) {
		return;
	}
	if (!types.map((t) => AuditLogEvent[t]).includes(entry.action)) {
		return;
	}
	return entry;
};
