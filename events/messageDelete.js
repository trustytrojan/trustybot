import assert from 'assert';
import { TextChannel } from 'discord.js';
import { getLatestAuditLogEntry, makeExecutorEmbedAuthor } from '../misc/util.js';

/**
 * @param {import('discord.js').Message & { client: import('../classes/Trustybot.js').default }} message
 */
export default async (message) => {
	const { client: tb, guild, channel, author, content, attachments, stickers } = message;
	const tg = tb.tguilds.get(guild.id);
	if (!tg?.logChannel)
		return;

	const logChannel = await guild.channels.fetch(tg.logChannel);
	assert(logChannel instanceof TextChannel);
	
	const entry = await getLatestAuditLogEntry(guild, 'MessageDelete');

	let imgurl;
	if (attachments.size === 1)
		imgurl = attachments.first().url;
	else if (stickers.size === 1)
		imgurl = stickers.first().url;
	
	logChannel.send({
		embeds: [{
			author: entry ? makeExecutorEmbedAuthor(entry.executor) : null,
			title: 'Message deleted',
			fields: [
				{ name: 'Channel', value: channel.toString(), inline: true },
				{ name: 'Author', value: author.toString(), inline: true },
				...(content.length ? [{ name: 'Content', value: content }] : []),
				...(attachments.size ? [{ name: 'Attachments', value: attachments.map(a => `[${a.name}](${a.url})`).join('\n') }] : []),
				...(stickers.size ? [{ name: 'Stickers', value: stickers.map(s => `[${s.name}](${s.url})`).join('\n') }] : [])
			],
			image: imgurl ? { url: imgurl } : null
		}]
	}).catch(tb.boundHandleError);
};