import { TextChannel, AuditLogEvent } from 'discord.js';
import { makeExecutorEmbedAuthor, msToHighestLevelTime } from '../misc/util.js';
import assert from 'assert';

/** @param {import('discord.js').GuildMember & TbOwned} */
export default async ({ client: tb, guild, user, joinedTimestamp }) => {
	const tg = tb.tguilds.get(guild.id);
	if (!tg?.logChannel)
		return;

	const channel = await guild.channels.fetch(tg.logChannel);
	assert(channel instanceof TextChannel);

	/** @type {import('discord.js').GuildAuditLogsEntry | undefined} */
	const entry = await guild.fetchLatestAuditLogEntry(['MemberKick', 'MemberBanAdd']);

	/** @type {'kicked' | 'banned' | undefined} */
	let kb;

	if (entry) {
		if (entry.action === AuditLogEvent.MemberKick)
			kb = 'kicked';
		else if (entry.action === AuditLogEvent.MemberBanAdd)
			kb = 'banned';
	}

	channel.send({
		embeds: [{
			author: entry ? makeExecutorEmbedAuthor(entry.executor) : null,
			title: `Member ${kb ?? 'left'}`,
			thumbnail: { url: user.displayAvatarURL() },
			description: user.toString(),
			fields: [
				...(entry?.reason?.length ? [{ name: `Reason`, value: entry.reason.slice(0, 1024) }] : []),
				{ name: 'Membership duration', value: msToHighestLevelTime(Date.now() - joinedTimestamp) }
			]
		}]
	}).catch(tb.boundHandleError);
};
