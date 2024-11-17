import { AuditLogEvent, GuildMember, TextChannel } from 'discord.js';
import { makeExecutorEmbedAuthor, msToHighestLevelTime } from '../misc/util.js';
import assert from 'node:assert';
import { TbOwned } from '../classes/Trustybot.js';
import { TbGuild } from '../misc/prototypes.js';

export default async ({ client: tb, guild, user, joinedTimestamp }: GuildMember & TbOwned) => {
	const tg = tb.tguilds.get(guild.id);
	if (!tg?.logChannel) {
		return;
	}

	const channel = await guild.channels.fetch(tg.logChannel);
	assert(channel instanceof TextChannel);

	const entry = await (guild as TbGuild).fetchLatestAuditLogEntry(['MemberKick', 'MemberBanAdd']);

	let action: 'kicked' | 'banned' | undefined;

	if (entry) {
		if (entry.action === AuditLogEvent.MemberKick) {
			action = 'kicked';
		} else if (entry.action === AuditLogEvent.MemberBanAdd) {
			action = 'banned';
		}
	}

	channel.send({
		embeds: [{
			author: entry?.executor ? makeExecutorEmbedAuthor(entry.executor) : void 0,
			title: `Member ${action ?? 'left'}`,
			thumbnail: { url: user.displayAvatarURL() },
			description: user.toString(),
			fields: [
				...(entry?.reason?.length ? [{ name: `Reason`, value: entry.reason.slice(0, 1024) }] : []),
				...(joinedTimestamp
					? [{
						name: 'Membership duration',
						value: joinedTimestamp ? msToHighestLevelTime(Date.now() - joinedTimestamp) : '(unknown)',
					}]
					: []),
			],
		}],
	}).catch(tb.boundHandleError);
};
