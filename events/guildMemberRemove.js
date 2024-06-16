import { TextChannel, AuditLogEvent } from 'discord.js';
import { makeExecutorEmbedAuthor, msToHighestLevelTime } from '../misc/util.js';
import assert from 'assert';

/** @param {import("discord.js").GuildMember & { client: import("../classes/Trustybot.js").default }} */
export default async ({ client: tb, guild, user, joinedTimestamp }) => {
	const tg = tb.tguilds.get(guild.id);
	if (!tg?.logChannel)
		return;

	const channel = await guild.channels.fetch(tg.logChannel);
	assert(channel instanceof TextChannel);

	/** @type {import('discord.js').GuildAuditLogsEntry | undefined} */
	let entry;

	/** @type {'kicked' | 'banned' | undefined} */
	let kb;

	await guild.fetchAuditLogs({ limit: 1 }).then(({ entries }) => {
		entry = entries.first();
		if (!entry?.targetId === user.id || ![AuditLogEvent.MemberKick, AuditLogEvent.MemberBanAdd].includes(entry.action))
			return;
		if (entry.action === AuditLogEvent.MemberKick) {
			kb = 'kicked';
		} else if (entry.action === AuditLogEvent.MemberBanAdd && entry.targetId === user.id) {
			kb = 'banned';
		}
	}).catch(tb.boundHandleError);

	channel.send({
		embeds: [{
			author: entry ? makeExecutorEmbedAuthor(entry.executor) : null,
			title: `Member ${kb ?? 'left'}`,
			thumbnail: { url: user.displayAvatarURL() },
			description: user.toString(),
			fields: [
				...(entry?.reason?.length ? [{ name: `Reason`, value: entry.reason }] : []),
				{ name: 'Membership duration', value: msToHighestLevelTime(Date.now() - joinedTimestamp) }
			]
		}]
	}).catch(tb.boundHandleError);
};
